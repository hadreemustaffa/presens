'use server';

import { exportToCsvSchema } from '@/features/attendance/summaries/actions/schemas';
import { getAllTimeSummary } from '@/features/attendance/summaries/api/attendance-summaries.api';
import { convertSummaryData } from '@/features/attendance/summaries/lib/utils';
import { createExportDataService } from '@/features/attendance/summaries/services/export-data/export-data';
import { validatedAction } from '@/lib/middleware';

export const exportToCsv = validatedAction(exportToCsvSchema, async (data) => {
  const { employee_id } = data;

  const summary = await getAllTimeSummary({ employee_id: employee_id });

  if (!summary) {
    return { error: 'Failed to get summary data' };
  }

  const csvData = convertSummaryData(summary);

  const service = createExportDataService();
  const csvString = await service.exportAttendanceSummaries('csv', csvData);

  if (!csvString) {
    return {
      error: 'Fail to download data as CSV',
    };
  }

  return {
    success: 'Successfully downloaded data as CSV',
    data: csvString,
    filename: `attendance_summary_${employee_id}_${new Date().toISOString().split('T')[0]}.csv`,
  };
});
