import { Departments, Remarks, WorkMode } from '@/types/enums';

export interface AttendanceRecord {
  id: number;
  employee_id: string;
  work_date: string;
  work_mode: WorkMode[keyof WorkMode];
  clock_in: string;
  clock_out: string | null;
  lunch_out: string | null;
  lunch_in: string | null;
  is_on_leave: boolean;
  remarks: Remarks | string | null;
}

export interface UserMetadata {
  email: string;
  full_name: string;
  user_role?: string;
  department: Departments[keyof Departments];
  employee_id: string;
}

export interface CountdownTimerProps {
  startTime: string;
  onComplete?: () => void;
}
