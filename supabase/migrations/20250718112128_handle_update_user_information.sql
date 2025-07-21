ALTER TABLE public.users
RENAME COLUMN update_at TO updated_at;

CREATE OR REPLACE FUNCTION public.sync_auth_users()
RETURNS TRIGGER
SET search_path = '' 
AS $$
BEGIN
    INSERT INTO public.users (
        id, 
        email, 
        full_name, 
        department, 
        employee_id,
        updated_at
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'department', 
        NEW.raw_user_meta_data->>'employee_id', 
        NOW()
    )
    ON CONFLICT (id) DO UPDATE 
    SET 
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        department = EXCLUDED.department,
        employee_id = EXCLUDED.employee_id,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_auth_users_trigger
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_auth_users();

CREATE TRIGGER handle_updated_at 
BEFORE UPDATE ON public.users FOR EACH ROW
EXECUTE PROCEDURE moddatetime (updated_at);