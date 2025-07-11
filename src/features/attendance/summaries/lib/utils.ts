import { AllTimeAttendanceSummary, CsvData } from '@/features/attendance/summaries/model/interfaces';

export function evaluateWorkModePolicyCompliance(
  homePct: number,
  officePct: number,
  policyHomePct = 40,
  tolerance = 5, // acceptable +/- range
) {
  let chartSummary: string;
  if (homePct > policyHomePct + tolerance) {
    chartSummary = 'Remote days is above average';
  } else {
    chartSummary = 'Within average work mode ratio';
  }

  const note = `Office: ${officePct.toFixed(0)}% | Home: ${homePct.toFixed(0)}%`;

  return { chartSummary, note };
}

/**
 * Converts an AllTimeAttendanceSummary object into a CsvData object,
 * formatting and stringifying fields as needed for CSV export.
 *
 * @param {AllTimeAttendanceSummary} data - The attendance summary data to convert.
 * @returns {CsvData} The formatted data ready for CSV output.
 */
export function convertSummaryData(data: AllTimeAttendanceSummary): CsvData {
  const isEmptyArray = (value: string[] | { date: string; name: string }[]) =>
    Array.isArray(value) && value.length === 0;

  return {
    employee_id: data.employee_id,
    total_days: data.total_days.toString(),
    total_hours: data.total_hours.toString(),
    avg_daily_hours: data.avg_daily_hours.toString(),
    leave_days: data.leave_days.toString(),
    leave_rate: data.leave_rate.toFixed(2),
    leave_dates: !isEmptyArray(data.leave_dates) ? data.leave_dates.join('; ') : '-',
    avg_lunch_minutes: data.avg_lunch_minutes.toString(),
    home_days: data.home_days.toString(),
    office_days: data.office_days.toString(),
    required_workdays: data.required_workdays.toString(),
    home_work_dates: !isEmptyArray(data.home_work_dates) ? data.home_work_dates.join('; ') : '-',
    office_work_dates: !isEmptyArray(data.office_work_dates) ? data.office_work_dates.join('; ') : '-',
    home_work_percentage: data.home_work_percentage.toFixed(2),
    office_work_percentage: data.office_work_percentage.toFixed(2),
    attendance_rate: data.attendance_rate.toFixed(2),
    avg_clock_in_time: data.avg_clock_in_time,
    avg_clock_out_time: data.avg_clock_out_time,
    clock_in_consistency_minutes: data.clock_in_consistency_minutes.toString(),
    incomplete_records_dates: !isEmptyArray(data.incomplete_records_dates)
      ? data.incomplete_records_dates.join('; ')
      : '-',
    preferred_home_days: !isEmptyArray(data.preferred_home_days) ? data.preferred_home_days.join('; ') : '-',
    public_holidays_dates: !isEmptyArray(data.public_holidays_dates)
      ? data.public_holidays_dates.map((holiday) => `${holiday.date}: ${holiday.name}`).join('; ')
      : '-',
    first_work_date: data.first_work_date,
  };
}
