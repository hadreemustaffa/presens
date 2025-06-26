create policy "Allow authorized update access on summaries" on public.attendance_summaries
for update
  using (authorize ('attendance_summaries.update'));

create policy "Allow authorized insert access on summaries" on public.attendance_summaries for INSERT
with
  check (authorize ('attendance_summaries.insert'));

create policy "Allow individual update access" on public.attendance_summaries
for update
  using (employee_id = ( SELECT users.employee_id
   FROM users
  WHERE (users.id = ( SELECT auth.uid() AS uid))));