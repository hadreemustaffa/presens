alter table public.attendance_records
drop column is_on_leave;

create view attendance_with_user
with
  (security_invoker = on) as
select
  u.full_name,
  u.department,
  ar.id,
  ar.work_date,
  ar.employee_id,
  ar.clock_in,
  ar.clock_out,
  ar.lunch_in,
  ar.lunch_out,
  ar.work_mode,
  ar.remarks
from
  attendance_records ar
  join users u on ar.employee_id = u.employee_id;