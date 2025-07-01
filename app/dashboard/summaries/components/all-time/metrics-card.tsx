'use client';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LUNCH_MAX_IDEAL_MINUTES,
  LUNCH_MIN_IDEAL_MINUTES,
  FULL_DAY_WORK_HOURS,
  CLOCK_IN_VARIATION_MAX_MINUTES,
  CLOCK_IN_VARIATION_MIN_MINUTES,
  ATTENDANCE_RATE_MIN_THRESHOLD_PERCENT,
  ATTENDANCE_RATE_MAX_THRESHOLD_PERCENT,
} from '@/lib/constants';
import { AllTimeAttendanceSummary } from '@/types/interfaces';

dayjs.extend(duration);

export function MetricsCard(summary: AllTimeAttendanceSummary) {
  return (
    <div className="grid grid-cols-1 gap-4 @2xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <AverageDailyWorkHoursCard avg_daily_hours={summary.avg_daily_hours} />

      <AverageLunchCard avg_lunch_minutes={summary.avg_lunch_minutes} />

      <AttendanceRateCard
        attendance_rate={summary.attendance_rate}
        total_days={summary.total_days}
        required_workdays={summary.required_workdays}
      />

      <ClockInConsistencyCard
        clock_in_consistency_minutes={summary.clock_in_consistency_minutes}
        avg_clock_in_time={summary.avg_clock_in_time}
      />
    </div>
  );
}

const AverageDailyWorkHoursCard = ({ avg_daily_hours }: Pick<AllTimeAttendanceSummary, 'avg_daily_hours'>) => {
  const isNull = avg_daily_hours === null;

  const avgDailyWorkHours = dayjs.duration(avg_daily_hours, 'hours');

  let footerSummary: string;
  let footerSubSummary: string;

  if (avg_daily_hours > FULL_DAY_WORK_HOURS + 1) {
    footerSummary = 'Ensure sustained work-life balance';
    footerSubSummary = 'Great effort but keep burnout in check';
  } else if (avg_daily_hours < FULL_DAY_WORK_HOURS) {
    footerSummary = 'Below daily target';
    footerSubSummary = 'Consider tracking interruptions or breaks';
  } else {
    footerSummary = 'Sustainable work pattern';
    footerSubSummary = `Aligned with expected working time`;
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Average Daily Work Hours</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {isNull ? (
            'N/A'
          ) : (
            <>
              {avgDailyWorkHours.hours()}
              <span className="text-primary">h</span>
              {avgDailyWorkHours.minutes()}
              <span className="text-primary">m</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <p className="line-clamp-1 flex gap-2 font-medium">{isNull ? '-' : footerSummary}</p>
        <p className="text-muted-foreground">{isNull ? 'Insufficient data' : footerSubSummary}</p>
      </CardFooter>
    </Card>
  );
};

const AverageLunchCard = ({ avg_lunch_minutes }: Pick<AllTimeAttendanceSummary, 'avg_lunch_minutes'>) => {
  const isNull = avg_lunch_minutes === null;

  const average = Math.round(avg_lunch_minutes);
  const avgDailyWorkHours = dayjs.duration(average, 'minutes');

  let footerSummary: string;
  let footerSubSummary: string;

  if (avg_lunch_minutes > LUNCH_MAX_IDEAL_MINUTES) {
    footerSummary = 'Longer than recommended';
    footerSubSummary = 'Consider optimizing break duration';
  } else if (avg_lunch_minutes < LUNCH_MIN_IDEAL_MINUTES) {
    footerSummary = 'Lunch breaks may be rushed';
    footerSubSummary = 'Consider balancing workload and rest';
  } else {
    footerSummary = 'Within normal range';
    footerSubSummary = `Consistent and healthy break time`;
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Average Lunch Duration</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {isNull ? (
            'N/A'
          ) : (
            <>
              {avgDailyWorkHours.hours()}
              <span className="text-primary">h</span> {avgDailyWorkHours.minutes()}
              <span className="text-primary">m</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <p className="line-clamp-1 flex gap-2 font-medium">{isNull ? '-' : footerSummary}</p>
        <p className="text-muted-foreground">{isNull ? 'Insufficient data' : footerSubSummary}</p>
      </CardFooter>
    </Card>
  );
};

const AttendanceRateCard = ({
  attendance_rate,
  total_days,
  required_workdays,
}: Pick<AllTimeAttendanceSummary, 'attendance_rate' | 'total_days' | 'required_workdays'>) => {
  const isNull = attendance_rate === null;

  let footerSummary: string;
  if (attendance_rate > ATTENDANCE_RATE_MIN_THRESHOLD_PERCENT) {
    footerSummary = 'Consistently present';
  } else if (attendance_rate < ATTENDANCE_RATE_MAX_THRESHOLD_PERCENT) {
    footerSummary = 'Below expected attendance';
  } else {
    footerSummary = 'Good overall work presence';
  }

  const formatPercentage = `${attendance_rate.toFixed(1)}`;

  const footerSubSummary = `Worked ${total_days} of ${required_workdays} days`;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Attendance Rate</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {isNull ? (
            'N/A'
          ) : (
            <p>
              {formatPercentage}
              <span className="text-primary">%</span>
            </p>
          )}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <p className="line-clamp-1 flex gap-2 font-medium">{isNull ? '-' : footerSummary}</p>
        <p className="text-muted-foreground">{isNull ? 'Insufficient data' : footerSubSummary}</p>
      </CardFooter>
    </Card>
  );
};

const ClockInConsistencyCard = ({
  clock_in_consistency_minutes,
  avg_clock_in_time,
}: Pick<AllTimeAttendanceSummary, 'clock_in_consistency_minutes' | 'avg_clock_in_time'>) => {
  const isNull = clock_in_consistency_minutes === null;

  const now = dayjs().format('YYYY MM DD');
  const clockInDurationMinutes = dayjs.duration(clock_in_consistency_minutes, 'minutes');
  const minClockIn = dayjs(`${now} ${avg_clock_in_time}`).format('HH:mma');
  const maxClockIn = dayjs(`${now} ${avg_clock_in_time}`)
    .add(clockInDurationMinutes.minutes(), 'minutes')
    .format('HH:mma');

  let footerSummary: string;
  if (clock_in_consistency_minutes > CLOCK_IN_VARIATION_MAX_MINUTES) {
    footerSummary = 'Inconsistent clock ins';
  } else if (clock_in_consistency_minutes < CLOCK_IN_VARIATION_MIN_MINUTES) {
    footerSummary = 'Highly consistent clock ins';
  } else {
    footerSummary = 'Generally on time';
  }

  const footerSubSummary = `Ranges between ${minClockIn} - ${maxClockIn}`;
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Clock In Consistency</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {isNull ? (
            'N/A'
          ) : (
            <>
              {clockInDurationMinutes.hours()}
              <span className="text-primary">h</span> {clockInDurationMinutes.minutes()}
              <span className="text-primary">m</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">{isNull ? '-' : footerSummary}</div>
        <div className="text-muted-foreground">{isNull ? 'Insufficient data' : footerSubSummary}</div>
      </CardFooter>
    </Card>
  );
};
