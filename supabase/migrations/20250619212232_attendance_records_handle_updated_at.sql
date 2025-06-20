create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before
update on public.attendance_records for each row
execute procedure moddatetime (updated_at);