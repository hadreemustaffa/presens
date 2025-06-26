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
  remarks: Remarks | string | null;
}

export interface AttendanceRecordWithUserDetails extends AttendanceRecord {
  full_name: string;
  department: Departments[keyof Departments];
}

export interface AllTimeAttendanceSummary {
  employee_id: string;
  total_days: number;
  total_hours: number;
  avg_daily_hours: number;
  leave_days: number;
  leave_rate: number;
  leave_dates: string[];
  avg_lunch_minutes: number;
  home_days: number;
  office_days: number;
  required_workdays: number;
  home_work_dates: string[];
  office_work_dates: string[];
  home_work_percentage: number;
  office_work_percentage: number;
  attendance_rate: number;
  avg_clock_in_time: string;
  avg_clock_out_time: string;
  clock_in_consistency_minutes: number;
  incomplete_records_dates: string[];
  preferred_home_days: string[];
  public_holidays_dates: {
    date: string;
    name: string;
  }[];
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
