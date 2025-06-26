'use client';

import { Label, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { evaluateWorkModePolicyCompliance } from '@/lib/dashboard/utils';
import { AllTimeAttendanceSummary } from '@/types/interfaces';

const chartConfig = {
  work_mode: {
    label: 'Work Mode',
  },
  days: {
    label: 'Days',
  },
  home: {
    label: 'Home',
    color: 'var(--foreground)',
  },
  office: {
    label: 'Office',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;

export function WorkModeChart(summary: AllTimeAttendanceSummary) {
  const chartData = [
    { work_mode: 'Home', days: summary.home_days, fill: 'var(--color-home)' },
    { work_mode: 'Office', days: summary.office_days, fill: 'var(--color-office)' },
  ];

  const { chartSummary, note } = evaluateWorkModePolicyCompliance(
    summary.home_work_percentage,
    summary.office_work_percentage,
  );

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardDescription>Work Mode Distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="days" nameKey="work_mode" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {summary.total_days}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Working Days
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <p className="flex items-center gap-2 leading-none font-medium">{chartSummary}</p>
        <p className="text-muted-foreground leading-none">{note}</p>
      </CardFooter>
    </Card>
  );
}
