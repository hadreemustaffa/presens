import { describe, expect, it } from 'vitest';

import { AllTimeAttendanceSummary } from '@/features/attendance/summaries/model/interfaces';

import { convertSummaryData } from './utils';

const mockSummary: AllTimeAttendanceSummary = {
  employee_id: 'emp123',
  total_days: 22,
  total_hours: 176,
  avg_daily_hours: 8.0,
  leave_days: 2,
  leave_rate: 0.09,
  leave_dates: ['2024-01-15', '2024-01-16'],
  avg_lunch_minutes: 45,
  home_days: 10,
  office_days: 12,
  required_workdays: 22,
  home_work_dates: ['2024-01-01', '2024-01-03'],
  office_work_dates: ['2024-01-02', '2024-01-04'],
  home_work_percentage: 45.45,
  office_work_percentage: 54.55,
  attendance_rate: 0.91,
  avg_clock_in_time: '09:00:00',
  avg_clock_out_time: '17:30:00',
  clock_in_consistency_minutes: 15,
  incomplete_records_dates: ['2024-01-10'],
  preferred_home_days: ['Monday', 'Wednesday'],
  public_holidays_dates: [
    { date: '2024-01-01', name: 'New Year Day' },
    { date: '2024-12-25', name: 'Christmas Day' },
  ],
  first_work_date: '2024-01-01',
};

const mockTransformedSummary = {
  employee_id: 'emp123',
  total_days: '22',
  total_hours: '176',
  avg_daily_hours: '8',
  leave_days: '2',
  leave_rate: '0.09',
  leave_dates: '2024-01-15; 2024-01-16',
  avg_lunch_minutes: '45',
  home_days: '10',
  office_days: '12',
  required_workdays: '22',
  home_work_dates: '2024-01-01; 2024-01-03',
  office_work_dates: '2024-01-02; 2024-01-04',
  home_work_percentage: '45.45',
  office_work_percentage: '54.55',
  attendance_rate: '0.91',
  avg_clock_in_time: '09:00:00',
  avg_clock_out_time: '17:30:00',
  clock_in_consistency_minutes: '15',
  incomplete_records_dates: '2024-01-10',
  preferred_home_days: 'Monday; Wednesday',
  public_holidays_dates: '2024-01-01: New Year Day; 2024-12-25: Christmas Day',
  first_work_date: '2024-01-01',
};

describe('ConvertSummaryData', () => {
  it('should transform data into format for CSV conversion', () => {
    const csvData = convertSummaryData(mockSummary);
    expect(csvData).toStrictEqual(mockTransformedSummary);
  });

  it('should handle empty arrays', () => {
    const csvData = convertSummaryData({
      ...mockSummary,
      incomplete_records_dates: [],
    });
    expect(csvData).toStrictEqual({
      ...mockTransformedSummary,
      incomplete_records_dates: '-',
    });
  });

  it('should handle empty public holidays', () => {
    const csvData = convertSummaryData({
      ...mockSummary,
      public_holidays_dates: [],
    });
    expect(csvData.public_holidays_dates).toBe('-');
  });
});
