create or replace function public.mobile_correspondent_call_stats(
  p_seven_days_start timestamptz,
  p_yesterday_start timestamptz,
  p_today_start timestamptz,
  p_tomorrow_start timestamptz
)
returns table (
  correspondent_id uuid,
  full_name text,
  is_active boolean,
  total_calls bigint,
  last_7_days_calls bigint,
  yesterday_calls bigint,
  today_calls bigint
)
language sql
stable
set search_path = ''
as $function$
  with correspondent_counts as (
    select
      p.id as correspondent_id,
      p.full_name,
      p.is_active,
      count(c.id) as total_calls,
      count(c.id) filter (
        where c.created_at >= p_seven_days_start and c.created_at < p_tomorrow_start
      ) as last_7_days_calls,
      count(c.id) filter (
        where c.created_at >= p_yesterday_start and c.created_at < p_today_start
      ) as yesterday_calls,
      count(c.id) filter (
        where c.created_at >= p_today_start and c.created_at < p_tomorrow_start
      ) as today_calls
    from public.profiles p
    left join public.call_logs c on c.called_by = p.id
    where p.role = 'block_correspondence'
    group by p.id, p.full_name, p.is_active
  ),
  overall_counts as (
    select
      null::uuid as correspondent_id,
      'Overall'::text as full_name,
      null::boolean as is_active,
      count(*) as total_calls,
      count(*) filter (
        where c.created_at >= p_seven_days_start and c.created_at < p_tomorrow_start
      ) as last_7_days_calls,
      count(*) filter (
        where c.created_at >= p_yesterday_start and c.created_at < p_today_start
      ) as yesterday_calls,
      count(*) filter (
        where c.created_at >= p_today_start and c.created_at < p_tomorrow_start
      ) as today_calls
    from public.call_logs c
  )
  select * from overall_counts
  union all
  select * from correspondent_counts
  order by correspondent_id nulls first, full_name;
$function$;

revoke all on function public.mobile_correspondent_call_stats(timestamptz, timestamptz, timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function public.mobile_correspondent_call_stats(timestamptz, timestamptz, timestamptz, timestamptz)
  to service_role;
