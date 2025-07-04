import { SupabaseClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import { revalidatePath } from 'next/cache';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { getActiveUser } from '@/api';
import {
  clockInHome,
  clockInOffice,
  clockOut,
  lunchIn,
  lunchOut,
  editRemarks,
  editRecord,
  deleteRecord,
  deleteMultipleRecords,
} from '@/features/attendance/records/actions/actions';
import { WorkMode, Remarks } from '@/features/shared/model/enums';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/types/supabase';

// Mock external dependencies
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/api', () => ({
  getActiveUser: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/middleware', () => ({
  validatedAction: vi.fn((schema, handler) => handler),
}));

// Test data
const mockUser = {
  id: 'mock-id',
  app_metadata: {},
  user_metadata: {
    employee_id: 'EMP001',
  },
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000',
};

const mockSupabaseClient = {
  from: vi.fn(),
};

const mockAttendanceTable = {
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  in: vi.fn(),
};

// Test utilities
const setupMocks = () => {
  vi.mocked(getActiveUser).mockResolvedValue({
    user: mockUser,
    isAdmin: false,
  });
  vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as unknown as SupabaseClient<Database>);

  mockSupabaseClient.from.mockReturnValue(mockAttendanceTable);
  mockAttendanceTable.insert.mockReturnValue({ error: null });
  mockAttendanceTable.update.mockReturnValue(mockAttendanceTable);
  mockAttendanceTable.delete.mockReturnValue(mockAttendanceTable);
  mockAttendanceTable.eq.mockReturnValue(mockAttendanceTable);
  mockAttendanceTable.in.mockReturnValue({ error: null, count: 1 });
};

describe('Attendance Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();

    // Mock dayjs to return consistent values
    vi.spyOn(dayjs.prototype, 'format').mockImplementation((format) => {
      if (format === 'HH:mm:ss') return '09:00:00';
      if (format === 'YYYY-MM-DD') return '2024-01-15';
      return '2024-01-15';
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Clock In Actions', () => {
    it('should successfully clock in from home', async () => {
      const result = await clockInHome();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('attendance_records');
      expect(mockAttendanceTable.insert).toHaveBeenCalledWith({
        employee_id: 'EMP001',
        clock_in: '09:00:00',
        work_mode: 'home',
        work_date: '2024-01-15',
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(result).toEqual({ success: true });
    });

    it('should successfully clock in from office', async () => {
      const result = await clockInOffice();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('attendance_records');
      expect(mockAttendanceTable.insert).toHaveBeenCalledWith({
        employee_id: 'EMP001',
        clock_in: '09:00:00',
        work_mode: 'office',
        work_date: '2024-01-15',
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(result).toEqual({ success: true });
    });

    it('should handle clock in database error', async () => {
      const mockError = new Error('Database connection failed');
      mockAttendanceTable.insert.mockReturnValue({ error: mockError });

      const result = await clockInHome();

      expect(result).toEqual({
        error: 'Failed to clock in. Please try again.',
      });
    });
  });

  describe('Clock Out Action', () => {
    it('should successfully clock out with predefined remark', async () => {
      const mockData = {
        remark: Remarks.EmergencyLeave,
        other_remark: undefined,
      };

      const result = await clockOut(mockData, {} as FormData);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('attendance_records');
      expect(mockAttendanceTable.update).toHaveBeenCalledWith({
        clock_out: '09:00:00',
        remarks: Remarks.EmergencyLeave,
      });
      expect(mockAttendanceTable.eq).toHaveBeenCalledWith('employee_id', 'EMP001');
      expect(mockAttendanceTable.eq).toHaveBeenCalledWith('work_date', '2024-01-15');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(result).toEqual({ success: 'You have clocked out.' });
    });

    it('should successfully clock out with custom remark', async () => {
      const mockData = {
        remark: undefined,
        other_remark: 'Personal appointment',
      };

      const result = await clockOut(mockData, {} as FormData);

      expect(mockAttendanceTable.update).toHaveBeenCalledWith({
        clock_out: '09:00:00',
        remarks: 'Personal appointment',
      });
      expect(result).toEqual({ success: 'You have clocked out.' });
    });

    it('should handle clock out database error', async () => {
      const mockError = new Error('Update failed');
      mockAttendanceTable.update.mockReturnValue(mockAttendanceTable);
      mockAttendanceTable.eq.mockReturnValueOnce(mockAttendanceTable).mockReturnValueOnce({ error: mockError });

      const result = await clockOut({ remark: Remarks.EmergencyLeave }, {} as FormData);

      expect(result).toEqual({
        error: 'Failed to clock out. Please try again.',
      });
    });
  });

  describe('Lunch Actions', () => {
    it('should successfully lunch out', async () => {
      const result = await lunchOut();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('attendance_records');
      expect(mockAttendanceTable.update).toHaveBeenCalledWith({
        lunch_out: '09:00:00',
      });
      expect(mockAttendanceTable.eq).toHaveBeenCalledWith('employee_id', 'EMP001');
      expect(mockAttendanceTable.eq).toHaveBeenCalledWith('work_date', '2024-01-15');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(result).toEqual({ success: true });
    });

    it('should successfully lunch in', async () => {
      const result = await lunchIn();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('attendance_records');
      expect(mockAttendanceTable.update).toHaveBeenCalledWith({
        lunch_in: '09:00:00',
      });
      expect(mockAttendanceTable.eq).toHaveBeenCalledWith('employee_id', 'EMP001');
      expect(mockAttendanceTable.eq).toHaveBeenCalledWith('work_date', '2024-01-15');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(result).toEqual({ success: true });
    });

    it('should handle lunch out database error', async () => {
      const mockError = new Error('Update failed');
      mockAttendanceTable.update.mockReturnValue(mockAttendanceTable);
      mockAttendanceTable.eq.mockReturnValueOnce(mockAttendanceTable).mockReturnValueOnce({ error: mockError });

      const result = await lunchOut();

      expect(result).toEqual({
        error: 'Failed to lunch out. Please try again.',
      });
    });
  });

  describe('Edit Remarks Action', () => {
    it('should successfully edit remarks with predefined remark', async () => {
      const mockData = {
        work_date: '2024-01-15',
        employee_id: 'EMP001',
        remarks: Remarks.EmergencyLeave,
        other_remarks: undefined,
      };

      const result = await editRemarks(mockData, {} as FormData);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('attendance_records');
      expect(mockAttendanceTable.update).toHaveBeenCalledWith({
        remarks: Remarks.EmergencyLeave,
      });
      expect(mockAttendanceTable.eq).toHaveBeenCalledWith('employee_id', 'EMP001');
      expect(mockAttendanceTable.eq).toHaveBeenCalledWith('work_date', '2024-01-15');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/records');
      expect(result).toEqual({ success: 'New remarks have been saved.' });
    });

    it('should successfully edit remarks with custom remark', async () => {
      const mockData = {
        work_date: '2024-01-15',
        employee_id: 'EMP001',
        remarks: undefined,
        other_remarks: 'Custom remark text',
      };

      const result = await editRemarks(mockData, {} as FormData);

      expect(mockAttendanceTable.update).toHaveBeenCalledWith({
        remarks: 'Custom remark text',
      });
      expect(result).toEqual({ success: 'New remarks have been saved.' });
    });

    it('should handle edit remarks database error', async () => {
      const mockError = new Error('Update failed');
      mockAttendanceTable.update.mockReturnValue(mockAttendanceTable);
      mockAttendanceTable.eq.mockReturnValueOnce(mockAttendanceTable).mockReturnValueOnce({ error: mockError });

      const result = await editRemarks({ work_date: '2024-01-15', employee_id: 'EMP001' }, {} as FormData);

      expect(result).toEqual({
        error: 'Failed to save new remarks. Please try again.',
      });
    });
  });

  describe('Edit Record Action', () => {
    it('should successfully edit a complete record', async () => {
      const mockData = {
        employee_id: 'EMP001',
        clock_in: '09:00:00',
        lunch_out: '12:00:00',
        lunch_in: '13:00:00',
        clock_out: '18:00:00',
        work_date: '2024-01-15',
        work_mode: WorkMode.Office,
      };

      const result = await editRecord(mockData, {} as FormData);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('attendance_records');
      expect(mockAttendanceTable.update).toHaveBeenCalledWith({
        clock_in: '09:00:00',
        lunch_out: '12:00:00',
        lunch_in: '13:00:00',
        clock_out: '18:00:00',
        work_mode: WorkMode.Office,
      });
      expect(mockAttendanceTable.eq).toHaveBeenCalledWith('employee_id', 'EMP001');
      expect(mockAttendanceTable.eq).toHaveBeenCalledWith('work_date', '2024-01-15');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/records');
      expect(result).toEqual({ success: 'Record has been edited.' });
    });

    it('should handle edit record database error', async () => {
      const mockError = new Error('Update failed');
      mockAttendanceTable.update.mockReturnValue(mockAttendanceTable);
      mockAttendanceTable.eq.mockReturnValueOnce(mockAttendanceTable).mockReturnValueOnce({ error: mockError });

      const mockData = {
        employee_id: 'EMP001',
        clock_in: '09:00:00',
        lunch_out: '12:00:00',
        lunch_in: '13:00:00',
        clock_out: '18:00:00',
        work_date: '2024-01-15',
        work_mode: WorkMode.Office,
      };

      const result = await editRecord(mockData, {} as FormData);

      expect(result).toEqual({
        error: 'Failed to edit record. Please try again.',
      });
    });
  });

  describe('Delete Record Action', () => {
    it('should successfully delete a single record', async () => {
      mockAttendanceTable.eq.mockReturnValue({ error: null, count: 1 });

      const result = await deleteRecord({ id: 123 }, {} as FormData);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('attendance_records');
      expect(mockAttendanceTable.delete).toHaveBeenCalledWith({ count: 'exact' });
      expect(mockAttendanceTable.eq).toHaveBeenCalledWith('id', 123);
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/records');
      expect(result).toEqual({ success: 'Record has been deleted.' });
    });

    it('should handle delete record when no record found', async () => {
      mockAttendanceTable.eq.mockReturnValue({ error: null, count: 0 });

      const result = await deleteRecord({ id: 999 }, {} as FormData);

      expect(result).toEqual({
        error: 'You do not have permission to delete this record, or it does not exist.',
      });
    });

    it('should handle delete record database error', async () => {
      const mockError = new Error('Delete failed');
      mockAttendanceTable.eq.mockReturnValue({ error: mockError, count: 0 });

      const result = await deleteRecord({ id: 123 }, {} as FormData);

      expect(result).toEqual({
        error: 'Failed to delete record. Please try again.',
      });
    });
  });

  describe('Delete Multiple Records Action', () => {
    it('should successfully delete multiple records', async () => {
      mockAttendanceTable.in.mockReturnValue({ error: null, count: 3 });

      const result = await deleteMultipleRecords({ ids: '1,2,3' }, {} as FormData);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('attendance_records');
      expect(mockAttendanceTable.delete).toHaveBeenCalledWith({ count: 'exact' });
      expect(mockAttendanceTable.in).toHaveBeenCalledWith('id', '1,2,3');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/records');
      expect(result).toEqual({ success: 'Records have been deleted.' });
    });

    it('should handle delete multiple records when no records found', async () => {
      mockAttendanceTable.in.mockReturnValue({ error: null, count: 0 });

      const result = await deleteMultipleRecords({ ids: '999,888' }, {} as FormData);

      expect(result).toEqual({
        error: 'You do not have permission to delete these records, or they do not exist.',
      });
    });

    it('should handle delete multiple records database error', async () => {
      const mockError = new Error('Bulk delete failed');
      mockAttendanceTable.in.mockReturnValue({ error: mockError, count: 0 });

      const result = await deleteMultipleRecords({ ids: '1,2,3' }, {} as FormData);

      expect(result).toEqual({
        error: 'Failed to delete selected records. Please try again.',
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle getActiveUser failure', async () => {
      vi.mocked(getActiveUser).mockRejectedValue(new Error('User not found'));

      await expect(clockInHome()).rejects.toThrow('User not found');
    });

    it('should handle createClient failure', async () => {
      vi.mocked(createClient).mockRejectedValue(new Error('Database connection failed'));

      await expect(clockInHome()).rejects.toThrow('Database connection failed');
    });

    it('should handle empty remark transformation', async () => {
      const mockData = {
        remark: null,
        other_remark: undefined,
      };

      await clockOut(mockData, {} as FormData);

      expect(mockAttendanceTable.update).toHaveBeenCalledWith({
        clock_out: '09:00:00',
        remarks: null,
      });
    });

    it('should prioritize other_remark over predefined remark', async () => {
      const mockData = {
        remark: Remarks.EmergencyLeave,
        other_remark: 'Custom message takes priority',
      };

      await clockOut(mockData, {} as FormData);

      expect(mockAttendanceTable.update).toHaveBeenCalledWith({
        clock_out: '09:00:00',
        remarks: 'Custom message takes priority',
      });
    });
  });
});
