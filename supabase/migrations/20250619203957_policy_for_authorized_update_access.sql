create policy "Allow authorized update access on records" on public.attendance_records
for update
  using (authorize ('attendance_records.update'));

insert into
  public.role_permissions (role, permission)
values
  ('admin', 'attendance_records.update')