alter table public.call_logs
  add column exam_applications text[],
  add column admit_card_downloaded boolean,
  add column interested_oav boolean;

alter table public.call_logs
  add constraint call_logs_exam_applications_valid
  check (
    exam_applications is null
    or (
      exam_applications <@ array['jnv', 'oav', 'none']::text[]
      and (
        not ('none' = any(exam_applications))
        or cardinality(exam_applications) = 1
      )
    )
  ),
  add constraint call_logs_admit_card_requires_jnv
  check (
    admit_card_downloaded is null
    or coalesce('jnv' = any(exam_applications), false)
  );
