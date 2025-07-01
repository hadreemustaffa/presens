'use client';

import { IconHourglassOff } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Building2, Calendar, ChevronLeft, ChevronRight, Home, X } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
}

export default function AttendanceCalendar({
  home_work_dates = [],
  office_work_dates = [],
  leave_dates = [],
  public_holidays_dates = [],
  incomplete_records_dates = [],
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

  // Get days in current month
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

  const getDayType = (day: number, month: number, year: number): DayType => {
    const date = dayjs().year(year).month(month).date(day);
    const dateStr = date.format('YYYY-MM-DD');
    const dayOfWeek = date.day();

    // Check if it's today
    if (date.isSame(today, 'day')) {
      return 'today';
    }
    // Check if it's a public holiday
    if (public_holidays_dates.some((holiday) => holiday.date === dateStr)) {
      return 'holiday';
    }
    // Check if it's a weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 'weekend';
    }
    // Check if it's an incomplete record
    if (incomplete_records_dates.includes(dateStr)) {
      return 'incomplete';
    }
    // Check if it's a leave date
    if (leave_dates.includes(dateStr)) {
      return 'leave';
    }
    // Check if it's a home work date
    if (home_work_dates.includes(dateStr)) {
      return 'home';
    }
    // Check if it's an office work date
    if (office_work_dates.includes(dateStr)) {
      return 'office';
    }
    // For future dates, return appropriate type
    if (date.isAfter(today, 'day')) {
      return 'office'; // Future dates show as office style but aren't explicitly marked
    }
    // Default to office for past dates (up to current date)
    return 'office';
  };

  const getDayStyles = (type: string, isCurrentMonth: boolean): string => {
    const baseStyles =
      'h-12 rounded-md flex items-center justify-center text-base border font-semibold transition-transform duration-200 hover:scale-105 cursor-pointer';

    const opacityClass = isCurrentMonth ? '' : 'opacity-40';

    switch (type) {
      case 'office':
        return `${baseStyles} bg-blue-800/10 border-blue-800/50 hover:bg-blue-800/50 ${opacityClass}`;
      case 'home':
        return `${baseStyles} bg-green-800/10 border-green-800/50 hover:bg-green-800/50 ${opacityClass}`;
      case 'leave':
        return `${baseStyles} bg-red-800/10 border-red-800/50 hover:bg-red-800/50 ${opacityClass}`;
      case 'weekend':
        return `${baseStyles} text-gray-500 ${opacityClass}`;
      case 'holiday':
        return `${baseStyles} bg-purple-800/10 border-purple-800/50 hover:bg-purple-800/50 ${opacityClass}`;
      case 'incomplete':
        return `${baseStyles} bg-foreground/10 border-foreground/50 hover:bg-foreground/50 ${opacityClass}`;
      case 'today':
        return `${baseStyles} bg-primary/10 relative after:content-[''] after:w-7 after:h-7 after:rounded-full after:border after:opacity-50 after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 border-primary/50 hover:bg-primary/50 ${opacityClass}`;
      default:
        return `${baseStyles} bg-white text-gray-800 border-gray-800/50 hover:bg-gray-50 ${opacityClass}`;
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
          className={getDayStyles(dayType, false)}
          title={holidayInfo?.name || `${dayType.charAt(0).toUpperCase() + dayType.slice(1)} day`}
        >
          {day}
        </div>,
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayType = getDayType(day, currentMonth, currentYear);
      const dateStr = currentDate.date(day).format('YYYY-MM-DD');
      const holidayInfo = getHolidayInfo(dateStr);

      days.push(
        <div
          key={day}
          className={getDayStyles(dayType, true)}
          title={holidayInfo?.name || `${dayType.charAt(0).toUpperCase() + dayType.slice(1)} day`}
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
          className={getDayStyles(dayType, false)}
          title={holidayInfo?.name || `${dayType.charAt(0).toUpperCase() + dayType.slice(1)} day`}
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
        <DropdownMenuItem>
          <Building2 className="text-blue-800" />
          Office
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Home className="text-green-800" />
          Home
        </DropdownMenuItem>
        <DropdownMenuItem>
          <X className="text-destructive" />
          Leave
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Calendar className="text-purple-800" />
          Public Holidays
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconHourglassOff className="text-foreground" />
          Incomplete Record
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
