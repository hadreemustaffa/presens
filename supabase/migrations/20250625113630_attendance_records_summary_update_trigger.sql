-- Trigger to automatically update summaries when attendance_records change
CREATE OR REPLACE FUNCTION trigger_update_attendance_summaries()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle both INSERT/UPDATE and DELETE cases
    IF TG_OP = 'DELETE' THEN
        PERFORM update_employee_monthly_summaries(OLD.employee_id);
        RETURN OLD;
    ELSE
        PERFORM update_employee_monthly_summaries(NEW.employee_id);
        -- If employee_id changed, also update old employee's summaries
        IF TG_OP = 'UPDATE' AND OLD.employee_id != NEW.employee_id THEN
            PERFORM update_employee_monthly_summaries(OLD.employee_id);
        END IF;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on attendance_records
DROP TRIGGER IF EXISTS tr_attendance_records_summary_update ON public.attendance_records;
CREATE TRIGGER tr_attendance_records_summary_update
    AFTER INSERT OR UPDATE OR DELETE ON public.attendance_records
    FOR EACH ROW EXECUTE FUNCTION trigger_update_attendance_summaries();