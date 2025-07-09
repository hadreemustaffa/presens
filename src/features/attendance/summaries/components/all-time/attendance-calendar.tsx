'use client';

import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type DayType = 'office' | 'home' | 'leave' | 'weekend' | 'holiday' | 'incomplete' | 'today';

interface PublicHoliday {
  date: string;
  name: string;
}

interface AttendanceCalendarProps {
  home_work_dates?: string[];
  office_work_dates?: string[];
  leave_dates?: string[];
  public_holidays_dates?: PublicHoliday[];
  incomplete_records_dates?: string[];
  first_work_date: string;
}

export default function AttendanceCalendar({
  home_work_dates = [],
  office_work_dates = [],
  leave_dates = [],
  public_holidays_dates = [],
  incomplete_records_dates = [],
  first_work_date = '',
}: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(dayjs());

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const currentMonth = currentDate.month();
  const currentYear = currentDate.year();
  const today = dayjs();

  const daysInMonth = currentDate.daysInMonth();
  const firstDayOfMonth = currentDate.startOf('month').day();

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(currentDate.subtract(1, 'month'));
    } else {
      setCurrentDate(currentDate.add(1, 'month'));
    }
  };

  const getHolidayInfo = (dateStr: string): PublicHoliday | null => {
    return public_holidays_dates.find((holiday) => holiday.date === dateStr) || null;
  };

  const getDayType = (day: number, month: number, year: number): DayType | undefined => {
    const date = dayjs().year(year).month(month).date(day);
    const dateStr = date.format('YYYY-MM-DD');
    const dayOfWeek = date.day();

    if (date.isSame(today, 'day')) return 'today';
    if (Array.isArray(public_holidays_dates) && public_holidays_dates.some((holiday) => holiday.date === dateStr)) {
      return 'holiday';
    }
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'weekend';
    const isIn = (arr?: string[]) => Array.isArray(arr) && arr.includes(dateStr);
    if (isIn(incomplete_records_dates)) return 'incomplete';
    if (isIn(leave_dates)) return 'leave';
    if (isIn(home_work_dates)) return 'home';
    if (isIn(office_work_dates)) return 'office';

    if (date.isAfter(today, 'day')) return undefined;

    if (first_work_date !== '') {
      if (date.isBefore(first_work_date, 'day')) return undefined;
    }

    return 'office';
  };

  const getDayStyles = (type: string, isCurrentMonth: boolean): string => {
    const baseStyles =
      'h-12 rounded-md flex items-center justify-center text-base border font-semibold transition-transform duration-200 hover:scale-105 cursor-pointer';

    const opacityClass = isCurrentMonth ? '' : 'opacity-40';

    switch (type) {
      case 'office':
        return `${baseStyles} bg-blue-500/10 border-blue-500/50 hover:bg-blue-500/50 ${opacityClass}`;
      case 'home':
        return `${baseStyles} bg-primary/10 border-primary/50 hover:bg-primary/50 ${opacityClass}`;
      case 'leave':
        return `${baseStyles} bg-red-500/10 border-red-500/50 hover:bg-red-500/50 ${opacityClass}`;
      case 'weekend':
        return `${baseStyles} text-gray-500 ${opacityClass}`;
      case 'holiday':
        return `${baseStyles} bg-purple-500/10 border-purple-500/50 hover:bg-purple-500/50 ${opacityClass}`;
      case 'incomplete':
        return `${baseStyles} bg-foreground/10 border-foreground/50 hover:bg-foreground/50 ${opacityClass}`;
      case 'today':
        return `${baseStyles} relative after:content-[''] after:w-7 after:h-7 after:rounded-full after:border after:opacity-50 after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 border-gray/50 ${opacityClass}`;
      default:
        return `${baseStyles} bg-white text-gray-500 border-gray-500/50 hover:bg-gray-50 ${opacityClass}`;
    }
  };

  const renderCalendarDays = () => {
    const days = [];

    // Previous month's trailing days
    const prevMonth = currentDate.subtract(1, 'month');
    const prevMonthDays = prevMonth.daysInMonth();

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const dayType = getDayType(day, prevMonth.month(), prevMonth.year());
      const dateStr = prevMonth.date(day).format('YYYY-MM-DD');
      const holidayInfo = getHolidayInfo(dateStr);

      days.push(
        <div
          key={`prev-${day}`}
          className={
            dayType
              ? getDayStyles(dayType, false)
              : 'flex h-12 items-center justify-center rounded-md border text-base opacity-40'
          }
          title={dayType ? holidayInfo?.name || `${dayType.charAt(0).toUpperCase() + dayType.slice(1)} day` : ''}
        >
          {day}
        </div>,
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayType = getDayType(day, currentMonth, currentYear);
      const dateStr = currentDate.date(day).format('YYYY-MM-DD');
      const holidayInfo = getHolidayInfo(dateStr);

      days.push(
        <div
          key={day}
          className={
            dayType
              ? getDayStyles(dayType, true)
              : 'flex h-12 items-center justify-center rounded-md border text-base opacity-40'
          }
          title={dayType ? holidayInfo?.name || `${dayType.charAt(0).toUpperCase() + dayType.slice(1)}` : ''}
        >
          {day}
        </div>,
      );
    }

    // Next month's leading days to fill the calendar grid
    const nextMonth = currentDate.add(1, 'month');
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDayOfMonth + daysInMonth);

    for (let day = 1; day <= remainingCells; day++) {
      const dayType = getDayType(day, nextMonth.month(), nextMonth.year());
      const dateStr = nextMonth.date(day).format('YYYY-MM-DD');
      const holidayInfo = getHolidayInfo(dateStr);

      days.push(
        <div
          key={`next-${day}`}
          className={
            dayType
              ? getDayStyles(dayType, false)
              : 'flex h-12 items-center justify-center rounded-md border text-base opacity-40'
          }
          title={dayType ? holidayInfo?.name || `${dayType.charAt(0).toUpperCase() + dayType.slice(1)}` : ''}
        >
          {day}
        </div>,
      );
    }

    return days;
  };

  return (
    <Card className="@container/card w-full">
      <CardHeader>
        <CardDescription className="mb-2 flex items-center justify-between">
          <p>Attendance Calendar</p>
          <CalendarLegend />
        </CardDescription>
        <CardTitle className="flex items-center justify-between text-2xl font-semibold tabular-nums">
          {monthNames[currentMonth]} {currentYear}
          <div className="flex items-center space-x-2">
            <Button variant={'outline'} size={'sm'} onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-2 w-2" />
            </Button>
            <Button variant={'outline'} size={'sm'} onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-2 w-2" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col">
        <div>
          <div className="mb-2 grid grid-cols-7 gap-2">
            {dayNames.map((day) => (
              <div key={day} className="rounded-md border py-2 text-center text-sm font-semibold">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>
        </div>
      </CardContent>
    </Card>
  );
}

const CalendarLegend = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={'outline'} size={'sm'} className="w-[84px] hover:cursor-pointer">
          Legend
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Day Colors</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <div className="h-4 w-4 rounded-full bg-blue-500"></div>
          Office
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="bg-primary h-4 w-4 rounded-full"></div>
          Home
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="bg-destructive h-4 w-4 rounded-full"></div>
          Leave
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="h-4 w-4 rounded-full bg-purple-500"></div>
          Public Holidays
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="bg-foreground h-4 w-4 rounded-full"></div>
          Incomplete Record
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
