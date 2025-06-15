-- inserts a row into public.users and assigns roles
create or replace function public.handle_new_user() 
returns trigger as $$
declare is_admin boolean;
begin
  insert into public.users (id, full_name, employee_id, email, department)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'employee_id', new.email, new.raw_user_meta_data->>'department');
  
  select count(*) = 1 from auth.users into is_admin;

  if position('+admin@presens' in new.email) > 0 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = auth, public;