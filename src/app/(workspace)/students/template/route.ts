import ExcelJS from 'exceljs';
import { requireAdmin } from '@/lib/auth/session';

export async function GET() {
  await requireAdmin();
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Students');
  worksheet.columns = [
    { header: 'Student Name', key: 'student_name', width: 28 },
    { header: 'Phone Number', key: 'phone_number', width: 20, style: { numFmt: '@' } },
    { header: 'District', key: 'district', width: 22 },
    { header: 'Block', key: 'block', width: 22 },
    { header: 'School', key: 'school', width: 28 },
    { header: 'Class', key: 'class', width: 16 },
    { header: 'Notes', key: 'notes', width: 40 },
  ];
  worksheet.getRow(1).font = { bold: true };
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  worksheet.autoFilter = 'A1:G1';
  const file = await workbook.xlsx.writeBuffer();
  return new Response(Buffer.from(file), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="student-upload-template.xlsx"',
      'Cache-Control': 'private, no-store',
    },
  });
}
