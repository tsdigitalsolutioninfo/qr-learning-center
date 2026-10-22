'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import ExcelJS from 'exceljs';
import { requireAdmin, requireProfile } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { normalizePhone } from '@/lib/utils/phone';
import { istInputToIso } from '@/lib/utils/ist';
import { callValues, interestValues, fail } from '@/lib/utils/labels';

const opt = z.string().trim().max(200).optional().transform((v) => v || null);
const studentSchema = z.object({
  student_name: z.string().trim().min(2).max(120), phone_number: z.string().trim(),
  district_id: z.string().uuid(), block_id: z.string().uuid(),
  school_name: opt, class_name: opt,
  notes: z.string().trim().max(2000).optional().transform((v) => v || null),
});

export type BulkUploadState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  issues?: string[];
  remainingIssueCount?: number;
};

const bulkStudentSchema = z.object({
  student_name: z.string().trim().min(2).max(120),
  phone_number: z.string().trim().min(1),
  district: z.string().trim().min(1).max(100),
  block: z.string().trim().min(1).max(100),
  school_name: opt,
  class_name: opt,
  notes: z.string().trim().max(2000).optional().transform((v) => v || null),
});

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_UPLOAD_ROWS = 500;
const MAX_ISSUES_TO_SHOW = 20;

function importFailure(message: string, issues: string[] = []): BulkUploadState {
  return {
    status: 'error',
    message,
    issues: issues.slice(0, MAX_ISSUES_TO_SHOW),
    remainingIssueCount: Math.max(0, issues.length - MAX_ISSUES_TO_SHOW),
  };
}

function locationKey(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
}

export async function bulkUploadStudents(_previousState: BulkUploadState, formData: FormData): Promise<BulkUploadState> {
  const me = await requireAdmin();
  const file = formData.get('file');
  if (!(file instanceof File) || !file.size) return importFailure('Choose an .xlsx workbook to upload.');
  if (!/\.xlsx$/i.test(file.name)) return importFailure('Only .xlsx Excel workbooks are supported.');
  if (file.size > MAX_UPLOAD_BYTES) return importFailure('The workbook must be 5 MB or smaller.');

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(await file.arrayBuffer());
  } catch (error) {
    console.error('bulkUploadStudents: invalid workbook', error instanceof Error ? error.message : 'unknown error');
    return importFailure('Could not read this workbook. Please check that it is a valid .xlsx file.');
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return importFailure('The workbook does not contain a worksheet.');
  if (worksheet.rowCount < 2) return importFailure('The first worksheet does not contain any student rows.');
  if (worksheet.rowCount > MAX_UPLOAD_ROWS + 1) return importFailure(`Upload no more than ${MAX_UPLOAD_ROWS} student rows at a time.`);

  const columnIndexes: Record<string, number> = {};
  const duplicateHeaders: string[] = [];
  const headerRow = worksheet.getRow(1);
  if (headerRow.cellCount > 20) return importFailure('The header row has too many columns.');
  for (let column = 1; column <= headerRow.cellCount; column += 1) {
    const name = headerRow.getCell(column).text.trim().replace(/^\uFEFF/, '').replace(/\s+/g, ' ').toLocaleLowerCase('en');
    if (!name) continue;
    if (columnIndexes[name]) duplicateHeaders.push(name);
    else columnIndexes[name] = column;
  }
  const requiredHeaders = ['student name', 'phone number', 'district', 'block'];
  const missingHeaders = requiredHeaders.filter((header) => !columnIndexes[header]);
  if (duplicateHeaders.length) return importFailure(`Duplicate column headers: ${duplicateHeaders.join(', ')}.`);
  if (missingHeaders.length) return importFailure(`Missing required columns: ${missingHeaders.map((header) => `"${header}"`).join(', ')}.`);

  const issues: string[] = [];
  const rowsToInsert: {
    student_name: string;
    phone_number: string;
    district_id: string;
    block_id: string;
    school_name: string | null;
    class_name: string | null;
    notes: string | null;
    interest_status: 'unknown';
    created_by: string;
  }[] = [];
  const firstRowByPhone = new Map<string, number>();
  const fieldLabels: Record<string, string> = {
    student_name: 'Student name',
    phone_number: 'Phone number',
    district: 'District',
    block: 'Block',
    school_name: 'School',
    class_name: 'Class',
    notes: 'Notes',
  };
  const getText = (row: ExcelJS.Row, column: number, rowNumber: number, field: string) => {
    const cell = row.getCell(column);
    if (cell.type === ExcelJS.ValueType.Formula) {
      issues.push(`Row ${rowNumber}: ${field} must contain a value, not a formula.`);
      return '';
    }
    return cell.text.trim();
  };

  const supabase = await createClient();
  const { data: districts, error: districtsError } = await supabase
    .from('districts').select('id, name').eq('is_active', true);
  const { data: blocks, error: blocksError } = await supabase
    .from('blocks').select('id, name, district_id').eq('is_active', true);
  const { data: correspondents, error: correspondentsError } = await supabase
    .from('profiles').select('block_id').eq('role', 'block_correspondence').eq('is_active', true);
  if (districtsError || blocksError || correspondentsError) {
    console.error('bulkUploadStudents: block/correspondent lookup failed', districtsError?.code, blocksError?.code, correspondentsError?.code);
    return importFailure('Could not verify districts, blocks, and correspondents. Please try again.');
  }
  const districtIdsByName = new Map((districts ?? []).map((district) => [locationKey(district.name), district.id]));
  const blockIdsByDistrictAndName = new Map((blocks ?? []).map((block) => [
    `${block.district_id}:${locationKey(block.name)}`,
    block.id,
  ]));
  const blocksWithCorrespondents = new Set((correspondents ?? []).map((correspondent) => correspondent.block_id));

  const optionalHeaders = ['school', 'class', 'notes'];
  const usedColumns = [...requiredHeaders, ...optionalHeaders]
    .map((header) => columnIndexes[header])
    .filter((column): column is number => Boolean(column));
  let nonEmptyRows = 0;
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    if (usedColumns.every((column) => !row.getCell(column).text.trim())) continue;
    nonEmptyRows += 1;
    const values = {
      student_name: getText(row, columnIndexes['student name'], rowNumber, 'Student name'),
      phone_number: getText(row, columnIndexes['phone number'], rowNumber, 'Phone number'),
      district: getText(row, columnIndexes.district, rowNumber, 'District'),
      block: getText(row, columnIndexes.block, rowNumber, 'Block'),
      school_name: columnIndexes.school ? getText(row, columnIndexes.school, rowNumber, 'School') : '',
      class_name: columnIndexes.class ? getText(row, columnIndexes.class, rowNumber, 'Class') : '',
      notes: columnIndexes.notes ? getText(row, columnIndexes.notes, rowNumber, 'Notes') : '',
    };
    const parsed = bulkStudentSchema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = String(issue.path[0] ?? '');
        issues.push(`Row ${rowNumber}: ${fieldLabels[field] ?? 'Value'} ${issue.message.toLowerCase()}.`);
      });
      continue;
    }
    const phone = normalizePhone(parsed.data.phone_number);
    if (!phone) {
      issues.push(`Row ${rowNumber}: Enter a valid Indian mobile number.`);
      continue;
    }
    const previousRow = firstRowByPhone.get(phone);
    if (previousRow) {
      issues.push(`Row ${rowNumber}: Phone number duplicates row ${previousRow}.`);
      continue;
    }
    firstRowByPhone.set(phone, rowNumber);

    const districtId = districtIdsByName.get(locationKey(parsed.data.district));
    if (!districtId) {
      issues.push(`Row ${rowNumber}: District "${parsed.data.district}" does not match an active district.`);
      continue;
    }
    const blockId = blockIdsByDistrictAndName.get(`${districtId}:${locationKey(parsed.data.block)}`);
    if (!blockId) {
      issues.push(`Row ${rowNumber}: Block "${parsed.data.block}" is not active in district "${parsed.data.district}".`);
      continue;
    }
    if (!blocksWithCorrespondents.has(blockId)) {
      issues.push(`Row ${rowNumber}: No active correspondent is assigned to block "${parsed.data.block}".`);
      continue;
    }
    rowsToInsert.push({
      student_name: parsed.data.student_name,
      phone_number: phone,
      district_id: districtId,
      block_id: blockId,
      school_name: parsed.data.school_name,
      class_name: parsed.data.class_name,
      notes: parsed.data.notes,
      interest_status: 'unknown',
      created_by: me.id,
    });
  }
  if (!nonEmptyRows) return importFailure('The first worksheet does not contain any student rows.');
  if (issues.length) return importFailure('No students were imported. Correct the rows below and upload the workbook again.', issues);

  const phones = [...firstRowByPhone.keys()];
  const existingPhones = new Set<string>();
  for (let offset = 0; offset < phones.length; offset += 100) {
    const { data: existing, error } = await supabase.from('students').select('phone_number').in('phone_number', phones.slice(offset, offset + 100));
    if (error) {
      console.error('bulkUploadStudents: duplicate lookup failed', error.code);
      return importFailure('Could not check for existing phone numbers. No students were imported.');
    }
    existing?.forEach((student) => existingPhones.add(student.phone_number));
  }
  if (existingPhones.size) {
    const duplicates = [...existingPhones].flatMap((phone) => {
      const rowNumber = firstRowByPhone.get(phone);
      return rowNumber ? [`Row ${rowNumber}: Phone number already exists in the student list.`] : [];
    });
    return importFailure('No students were imported. Remove existing phone numbers and upload the workbook again.', duplicates);
  }

  const { error } = await supabase.from('students').insert(rowsToInsert);
  if (error) {
    console.error('bulkUploadStudents: insert failed', error.code);
    return importFailure(error.code === '23503'
      ? 'A district or block changed during upload. No students were imported; refresh the workbook and retry.'
      : 'Could not save the students. No students were imported.');
  }
  revalidatePath('/students');
  revalidatePath('/dashboard');
  return { status: 'success', message: `${rowsToInsert.length} students imported. Correspondents for each selected block can now manage them.` };
}

export async function addStudent(formData: FormData) {
  const me = await requireAdmin();
  const parsed = studentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail('/students/new', 'Please check the required fields.');
  const phone = normalizePhone(parsed.data.phone_number);
  if (!phone) return fail('/students/new', 'Enter a valid Indian mobile number.');
  const supabase = await createClient();
  const { data, error } = await supabase.from('students').insert({ ...parsed.data, phone_number: phone, interest_status: 'unknown', created_by: me.id }).select('id').single();
  if (error) { console.error('addStudent', error.code); return fail('/students/new', error.code === '23503' ? 'Block does not belong to that district.' : 'Could not save the student.'); }
  redirect(`/students/${data.id}?saved=1`);
}

export async function archiveStudent(formData: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(formData.get('id'));
  const supabase = await createClient();
  const { error } = await supabase.from('students').update({ archived_at: new Date().toISOString() }).eq('id', id);
  if (error) return fail(`/students/${id}`, 'Could not archive the student.');
  redirect('/students');
}

const callSchema = z.object({
  student_id: z.string().uuid(), request_id: z.string().uuid(), call_status: z.enum(callValues), interest_status: z.enum(interestValues),
  notes: z.string().trim().max(2000).optional().transform((v) => v || null), follow_up_at: z.string().optional(),
});
export async function recordCall(formData: FormData) {
  const me = await requireProfile();
  const back = `/students/${String(formData.get('student_id'))}/call`;
  const parsed = callSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(back, 'Please check the call details.');
  const d = parsed.data;
  const required = formData.get('follow_up_required') === 'on';
  let followUp: string | null = null;
  if (required) {
    followUp = d.follow_up_at ? istInputToIso(d.follow_up_at) : null;
    if (!followUp || new Date(followUp) <= new Date()) return fail(back, 'Choose a follow-up date and time in the future.');
  }
  const supabase = await createClient();
  const { error } = await supabase.from('call_logs').insert({
    student_id: d.student_id, called_by: me.id, call_status: d.call_status, interest_status: d.interest_status, notes: d.notes,
    follow_up_required: required, follow_up_at: followUp, request_id: d.request_id, call_started_at: null,
  });
  // 23505 = same request_id already saved (double submit): treat as success without duplicating.
  if (error && error.code !== '23505') {
    console.error('recordCall', error.code);
    return fail(back, error.code === '42501' ? 'This student is not in your block.' : 'Could not save the call. Nothing was recorded.');
  }
  revalidatePath('/dashboard');
  redirect(`/students/${d.student_id}?saved=1`);
}
