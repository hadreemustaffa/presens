import { ArrowRightFromLine, ArrowRightToLine, Coffee } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttendanceRecord } from '@/lib/types/interfaces';
import { formatTimeToday, getTimeOfDayAbbr } from '@/lib/utils';

export function ActivityCards(record: AttendanceRecord) {
  return (
    <Card className="@container/card">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Today&apos;s Activity</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 @[640px]/card:grid-cols-2">
        {record.clock_in && (
          <Activity
            title="Clocked In"
            time={record.clock_in}
            icon={<ArrowRightToLine className="h-5 w-5 text-green-500 sm:h-7 sm:w-7" />}
          />
        )}
        {record.lunch_out && (
          <Activity
            title="On Lunch Break"
            time={record.lunch_out}
            icon={<Coffee className="h-5 w-5 text-yellow-500 sm:h-7 sm:w-7" />}
          />
        )}
        {record.lunch_in && (
          <Activity
            title="Returned from Lunch"
            time={record.lunch_in}
            icon={<Coffee className="h-5 w-5 text-blue-500 sm:h-7 sm:w-7" />}
          />
        )}
        {record.clock_out && (
          <Activity
            title="Clocked Out"
            time={record.clock_out}
            icon={<ArrowRightFromLine className="text-primary h-5 w-5 sm:h-7 sm:w-7" />}
          />
        )}
      </CardContent>
    </Card>
  );
}

const Activity = ({ title, time, icon }: { title: string; time: string; icon?: React.ReactNode }) => {
  return (
    <div className="flex flex-row items-center justify-between gap-4 rounded-md border px-4 py-2">
      <div className="hidden sm:block">{icon}</div>
      <div className="flex w-full flex-row items-center gap-4">
        <span className="sm:hidden">{icon}</span>
        <div className="flex flex-col">
          <p className="text-sm">{title}</p>
          <p className="text-lg font-semibold">
            {formatTimeToday(time, 'HH:mm')}
            <span className="text-muted-foreground ml-1 text-xs font-normal">{getTimeOfDayAbbr(time)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
