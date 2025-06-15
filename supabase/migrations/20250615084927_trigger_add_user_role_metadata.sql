create or replace function update_user_metadata () returns trigger as $$
declare
    user_role public.app_roles;
begin
  -- Check if the user is marked as admin in the users table
  select role into user_role from public.user_roles where user_id = new.user_id;
  
  if user_role is not null then
    update auth.users
    set raw_user_meta_data = raw_user_meta_data || jsonb_build_object('user_role', to_jsonb(user_role))
    where id = new.user_id;
  end if;

  return new;
end;
$$ language plpgsql;

create
or replace trigger on_user_role_change
after insert
or
update on public.user_roles for each row
execute function update_user_metadata ();