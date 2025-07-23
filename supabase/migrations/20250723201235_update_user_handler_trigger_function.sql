create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, full_name, employee_id, email, department)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'employee_id', new.email, new.raw_user_meta_data->>'department');
  
  return new;
end;
$$ language plpgsql security definer set search_path = auth, public;