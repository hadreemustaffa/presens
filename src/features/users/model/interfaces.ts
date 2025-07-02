import { Departments } from '@/features/model/enums';

export interface UserMetadata {
  email: string;
  full_name: string;
  user_role?: string;
  department: Departments[keyof Departments];
  employee_id: string;
}
