import { Departments, Remarks, WorkMode } from '@/features/shared/model/enums';
import { SortDirection } from '@/lib/types/types';

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

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: SortDirection;
  filters?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
