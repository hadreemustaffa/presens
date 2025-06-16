import { IconTrendingDown } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTime, getTimeOfDay } from '@/lib/utils';
import { AttendanceRecord } from '@/types/interfaces';

export function SectionCards(record: AttendanceRecord) {
  const timeOfDay = getTimeOfDay({ abbreviate: true });

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {record.clock_in && (
        <>
          <h2 className="text-2xl font-semibold">Daily Activity</h2>

          <div className="bg-accent/50 flex flex-row items-center justify-between gap-2 rounded-md border px-4 py-2">
            <p>Clock In</p>
            <p className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatTime(record.clock_in, 'HH:mm')}
              <span className="text-base font-normal">{timeOfDay}</span>
            </p>
          </div>
        </>
      )}
      {record.lunch_out && (
        <div className="bg-accent/50 flex flex-row items-center justify-between gap-2 rounded-md border px-4 py-2">
          <p>Clock In</p>
          <p className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatTime(record.lunch_out, 'HH:mm')}
            <span className="text-base font-normal">{timeOfDay}</span>
          </p>
        </div>
      )}
      {record.lunch_in && (
        <div className="bg-accent/50 flex flex-row items-center justify-between gap-2 rounded-md border px-4 py-2">
          <p>Clock In</p>
          <p className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatTime(record.lunch_in, 'HH:mm')}
            <span className="text-base font-normal">{timeOfDay}</span>
          </p>
        </div>
      )}
      {record.clock_out && (
        <div className="bg-accent/50 flex flex-row items-center justify-between gap-2 rounded-md border px-4 py-2">
          <p>Clock In</p>
          <p className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatTime(record.clock_out, 'HH:mm')}
            <span className="text-base font-normal">{timeOfDay}</span>
          </p>
        </div>
      )}
    </div>
  );
}
