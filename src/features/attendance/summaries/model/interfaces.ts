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
  first_work_date: string;
}

export interface CsvData {
  [key: string]: string;
}

export interface Exporter {
  export(data: CsvData): Promise<string>;
}
