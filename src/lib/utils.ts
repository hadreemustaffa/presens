import { clsx, type ClassValue } from 'clsx';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { twMerge } from 'tailwind-merge';

import { LUNCH_HOURS, FULL_DAY_WORK_HOURS, TIME_FORMAT, DATE_FORMAT, TZ_KUALA_LUMPUR } from '@/lib/constants';

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertUtcToLocalTime(time: string, timezone: string) {
  return dayjs.utc(`${time}`).tz(timezone);
}

export function convertLocalTimeToUTC(localTime: string, workDate: string) {
  return dayjs(`${workDate} ${localTime}`).utc();
}

export function formatTimeForInput(timestamp: string) {
  if (!timestamp) return '';
  return convertUtcToLocalTime(timestamp, TZ_KUALA_LUMPUR).format('HH:mm');
}

export function formatTimeForDatabase(timeValue: string, workDate: string) {
  if (!timeValue) return '';
  return convertLocalTimeToUTC(timeValue, workDate).format();
}

export function formatTimeForDisplay(timestamp: string, format: string = 'HH:mm A') {
  if (!timestamp) return '-';
  return convertUtcToLocalTime(timestamp, TZ_KUALA_LUMPUR).format(format);
}

export function getRemainingWorkHours(workStart: string, time?: string) {
  if (!time) {
    time = dayjs().format('YYYY-MM-DD HH:mm:ssZ');
  }

  const startTime = convertUtcToLocalTime(workStart, TZ_KUALA_LUMPUR);
  const endTime = startTime.add(FULL_DAY_WORK_HOURS + LUNCH_HOURS, 'hours');
  const currentTime = convertUtcToLocalTime(time, TZ_KUALA_LUMPUR);

  const totalSeconds = endTime.diff(currentTime, 'seconds');

  if (totalSeconds <= 0 || !currentTime.isBetween(startTime, endTime, null, '[]')) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds };
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatNumber(value: number) {
  return Intl.NumberFormat('en', { notation: 'compact' }).format(value);
}

export const getCurrentTime = (): string => dayjs().format(TIME_FORMAT);
export const getCurrentDate = (): string => dayjs().format(DATE_FORMAT);
