'use client';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { convertTimeTodayToDayjs, getRemainingWorkHours, getTimeOfDayAbbr } from '@/lib/utils';
import { AttendanceRecord } from '@/types/interfaces';

dayjs.extend(duration);

type AttendanceStatus = 'clocked-out' | 'on-lunch' | 'clocked-in';

interface StatusInfo {
  label: string;
  bgColor: string;
  textColor: string;
}

const STATUS_CONFIG: Record<AttendanceStatus, StatusInfo> = {
  'clocked-out': {
    label: 'Clocked Out',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  },
  'on-lunch': {
    label: 'On Lunch Break',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  'clocked-in': {
    label: 'Clocked In',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
};

export default function StatusCard(record: AttendanceRecord) {
  const getAttendanceStatus = (): AttendanceStatus => {
    if (record.clock_out) return 'clocked-out';
    if (record.lunch_out && !record.lunch_in) return 'on-lunch';
    return 'clocked-in';
  };

  const status = getAttendanceStatus();
  const statusInfo = STATUS_CONFIG[status];
  const expectedEnd = convertTimeTodayToDayjs(record.clock_in).add(9, 'hours').format('HH:mm');
  const timeAbbr = getTimeOfDayAbbr(expectedEnd);

  return (
    <Card className="@container/card">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Current Status</CardTitle>
        <div className={`rounded-full px-3 py-1 text-sm font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
          {statusInfo.label}
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-4 @[400px]/card:grid-cols-2 @[768px]/main:grid-cols-2">
        <TimeRemainingStatus {...record} />
        <div>
          <p className="mb-1 text-sm">Expected End</p>
          {!record.clock_out ? (
            <p className="text-lg font-bold">
              {expectedEnd}
              <span className="text-muted-foreground ml-1 text-xs font-normal">{timeAbbr}</span>
            </p>
          ) : (
            <p className="text-lg font-bold">N/A</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const TimeRemainingStatus = (record: AttendanceRecord) => {
  const [remaining, setRemaining] = useState(getRemainingWorkHours(record.clock_in));

  useEffect(() => {
    if (!record.clock_in || record.clock_out) return;

    // Update every minute
    const interval = setInterval(() => {
      setRemaining(getRemainingWorkHours(record.clock_in));
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [record.clock_in, record.clock_out]);

  const { hours, minutes } = remaining;

  return (
    <div>
      <p className="mb-1 text-sm whitespace-nowrap">Time until work ends</p>
      <p className="text-lg font-bold whitespace-nowrap">
        {record.clock_out ? (
          <>N/A</>
        ) : (
          <>
            {hours} hours {minutes} minutes
          </>
        )}
      </p>
    </div>
  );
};
