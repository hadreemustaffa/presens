'use client';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Bar, CartesianGrid, BarChart, XAxis } from 'recharts';

import TimeframeSelect from '@/app/dashboard/summaries/components/timeframe-select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Timeframe } from '@/lib/types/enums';
import { DailyDataRecord } from '@/lib/types/interfaces';
import { formatNumber } from '@/lib/utils';

dayjs.extend(duration);

export const description = 'A chart displaying daily hours worked and lunch taken minutes';

const chartConfig = {
  date: {
    label: 'Date',
  },
  hours_worked: {
    label: 'Hours Worked',
    color: 'var(--primary)',
  },
  lunch_taken_minutes: {
    label: 'Lunch Minutes',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export default function DailyDataChart({ record }: { record: DailyDataRecord[] }) {
  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>('hours_worked');

  const searchParams = useSearchParams();
  const selectedTimeframe = Number(searchParams.get('timeframe')) || 30;

  const chartData = useMemo(
    () =>
      record.map((record) => ({
        date: record.date,
        hours_worked: record.hours_worked,
        lunch_taken_minutes: record.lunch_taken_minutes,
      })),
    [record],
  );

  const total = useMemo(
    () => ({
      hours_worked: chartData.reduce((acc, curr) => acc + (curr.hours_worked ?? 0), 0),
      lunch_taken_minutes: chartData.reduce((acc, curr) => acc + (curr.lunch_taken_minutes ?? 0), 0),
    }),
    [chartData],
  );

  let timeframeText: string;
  if (selectedTimeframe === Timeframe['30 days']) {
    timeframeText = 'month';
  } else if (selectedTimeframe === Timeframe['90 days']) {
    timeframeText = '3 months';
  } else if (selectedTimeframe === Timeframe['180 days']) {
    timeframeText = '6 months';
  } else if (selectedTimeframe === Timeframe['1 year']) {
    timeframeText = 'year';
  } else {
    timeframeText = 'week';
  }

  return (
    <Card className="col-span-1 py-0 @[840px]/main:col-span-2">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 @lg/main:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 @lg/main:!py-0">
          <CardDescription>Daily Trends</CardDescription>
          <CardTitle>Showing past {timeframeText} data</CardTitle>
        </div>

        <div className="flex">
          {['hours_worked', 'lunch_taken_minutes'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="group relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l @lg/main:border-t-0 @lg/main:border-l @lg/main:px-8 @lg/main:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground group-data-[active=true]:text-primary text-xs whitespace-nowrap">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {formatNumber(total[key as keyof typeof total])}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="relative h-full place-content-center px-2 sm:p-6 sm:pb-0">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 px-6 pb-6 text-sm">
        <div className="flex flex-col gap-2">
          <p className="flex gap-2 leading-none font-medium">
            Averaging around{' '}
            {activeChart === 'hours_worked' ? (
              <>{(total.hours_worked / record.length).toFixed(1)} hours daily</>
            ) : (
              <>{Math.round(total.lunch_taken_minutes / record.length)} minutes daily</>
            )}
          </p>
          <p className="text-muted-foreground leading-none">Based on the daily average for the past {timeframeText}</p>
        </div>
        <TimeframeSelect />
      </CardFooter>
    </Card>
  );
}
