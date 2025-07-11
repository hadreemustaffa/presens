import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getAllTimeSummary } from '@/features/attendance/summaries/api/attendance-summaries.api';
import { AllTimeAttendanceSummary } from '@/features/attendance/summaries/model/interfaces';
import * as exportDataModule from '@/features/attendance/summaries/services/export-data/export-data';

import { exportToCsv } from './actions';

vi.mock('@/features/attendance/summaries/api/attendance-summaries.api', () => ({
  getAllTimeSummary: vi.fn(),
}));

vi.mock('@/lib/middleware', () => ({
  validatedAction: vi.fn((schema, action) => action),
}));

const mockSummary: AllTimeAttendanceSummary = {
  employee_id: 'EMP001',
  total_days: 22,
  total_hours: 176,
  avg_daily_hours: 8,
  leave_days: 2,
  leave_rate: 0.09,
  leave_dates: ['2024-07-01', '2024-07-15'],
  avg_lunch_minutes: 45,
  home_days: 10,
  office_days: 12,
  required_workdays: 22,
  home_work_dates: ['2024-07-02', '2024-07-03'],
  office_work_dates: ['2024-07-04', '2024-07-05'],
  home_work_percentage: 45.45,
  office_work_percentage: 54.55,
  attendance_rate: 0.95,
  avg_clock_in_time: '09:05',
  avg_clock_out_time: '18:00',
  clock_in_consistency_minutes: 10,
  incomplete_records_dates: ['2024-07-10'],
  preferred_home_days: ['Monday', 'Friday'],
  public_holidays_dates: [{ date: '2024-07-09', name: 'Independence Day' }],
  first_work_date: '2024-07-01',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAllTimeSummary).mockResolvedValue(mockSummary);
  vi.setSystemTime(new Date('2024-01-01'));
});

describe('exportToCsv', () => {
  const currentDate = '2024-01-01';
  const successMessage = 'Successfully downloaded data as CSV';

  it('should export correct CSV data successfully', async () => {
    const data = { employee_id: 'EMP001' };
    const result = await exportToCsv(data, {} as FormData);

    const expectedCsvString =
      'employee_id;total_days;total_hours;avg_daily_hours;leave_days;leave_rate;leave_dates;avg_lunch_minutes;home_days;office_days;required_workdays;home_work_dates;office_work_dates;home_work_percentage;office_work_percentage;attendance_rate;avg_clock_in_time;avg_clock_out_time;clock_in_consistency_minutes;incomplete_records_dates;preferred_home_days;public_holidays_dates;first_work_date\r\n' +
      'EMP001;22;176;8;2;0.09;"2024-07-01; 2024-07-15";45;10;12;22;"2024-07-02; 2024-07-03";"2024-07-04; 2024-07-05";45.45;54.55;0.95;09:05;18:00;10;2024-07-10;"Monday; Friday";2024-07-09: Independence Day;2024-07-01';

    if ('success' in result) {
      expect(result.success).toBe(successMessage);
      expect(result.data).toEqual(expectedCsvString);
      expect(result.filename).toMatch(`attendance_summary_${mockSummary.employee_id}_${currentDate}.csv`);
    } else {
      throw new Error(`Expected success result, got error: ${result.error}`);
    }
  });

  it('handles empty arrays in the summary data', async () => {
    vi.mocked(getAllTimeSummary).mockResolvedValue({
      ...mockSummary,
      incomplete_records_dates: [],
      public_holidays_dates: [],
    });

    const data = { employee_id: 'EMP001' };
    const result = await exportToCsv(data, {} as FormData);

    const expectedCsvString =
      'employee_id;total_days;total_hours;avg_daily_hours;leave_days;leave_rate;leave_dates;avg_lunch_minutes;home_days;office_days;required_workdays;home_work_dates;office_work_dates;home_work_percentage;office_work_percentage;attendance_rate;avg_clock_in_time;avg_clock_out_time;clock_in_consistency_minutes;incomplete_records_dates;preferred_home_days;public_holidays_dates;first_work_date\r\n' +
      'EMP001;22;176;8;2;0.09;"2024-07-01; 2024-07-15";45;10;12;22;"2024-07-02; 2024-07-03";"2024-07-04; 2024-07-05";45.45;54.55;0.95;09:05;18:00;10;-;"Monday; Friday";-;2024-07-01';

    if ('success' in result) {
      expect(result.success).toBe(successMessage);
      expect(result.data).toEqual(expectedCsvString);
      expect(result.filename).toMatch(`attendance_summary_${mockSummary.employee_id}_${currentDate}.csv`);
    } else {
      throw new Error(`Expected success result, got error: ${result.error}`);
    }
  });

  it('should handle missing summary data', async () => {
    vi.mocked(getAllTimeSummary).mockResolvedValue(undefined as unknown as AllTimeAttendanceSummary);

    const data = { employee_id: 'EMP001' };
    const result = await exportToCsv(data, {} as FormData);

    expect(result).toEqual({
      error: 'Failed to get summary data',
    });
  });

  it('should handle export error', async () => {
    vi.mocked(getAllTimeSummary).mockResolvedValue(mockSummary);

    // Spy and mock only for this test
    vi.spyOn(exportDataModule, 'createExportDataService').mockReturnValue({
      exportAttendanceSummaries: vi.fn().mockResolvedValue(undefined),
    } as unknown as exportDataModule.ExportDataService);

    const data = { employee_id: 'EMP001' };
    const result = await exportToCsv(data, {} as FormData);

    expect(result).toEqual({
      error: 'Fail to download data as CSV',
    });
  });
});
