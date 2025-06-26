import { clsx, type ClassValue } from 'clsx';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { twMerge } from 'tailwind-merge';

import { LUNCH_HOURS, FULL_DAY_WORK_HOURS } from '@/lib/constants';

dayjs.extend(isBetween);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTimeOfDay() {
  const now = dayjs();
  const hours = now.hour();
  if (hours >= 0 && hours < 12) {
    return 'morning';
  } else if (hours >= 12 && hours < 18) {
    return 'afternoon';
  } else {
    return 'evening';
  }
}

export function getTimeOfDayAbbr(time: string) {
  const today = dayjs().format('YYYY-MM-DD');

  const recordedTime = dayjs(`${today} ${time}`);
  const hours = recordedTime.hour();
  if (hours >= 0 && hours < 12) {
    return 'AM';
  } else if (hours >= 12 && hours < 18) {
    return 'PM';
  } else {
    return 'PM';
  }
}

/**
 * Formats a timestamp string into a human-readable format.
 * @param {string} timestamp - Timestamp string in YYYY-MM-DD HH:mm:ss format.
 * @param {string} format - Format string for dayjs.
 * @returns Formatted string.
 */
export function formatTime(timestamp: string, format: string) {
  return dayjs(timestamp).format(`${format}`);
}

/**
 * Formats a timestamp string into a human-readable format, assuming the timestamp is in the current day.
 * @param {string} timestamp - Timestamp string in HH:mm:ss format.
 * @param {string} format - Format string for dayjs.
 * @returns Formatted string.
 */
export function formatTimeToday(timestamp: string, format?: string) {
  const today = dayjs().format('YYYY-MM-DD');
  return dayjs(`${today} ${timestamp}`).format(`${format}`);
}

/**
 * Converts a timestamp string in the format of HH:mm:ss to a dayjs object
 * of the current day.
 * @param {string} timestamp - Timestamp string in HH:mm:ss format.
 * @returns A dayjs object of the current day.
 */
export function convertTimeTodayToDayjs(timestamp: string) {
  const today = dayjs().format('YYYY-MM-DD');
  return dayjs(`${today} ${timestamp}`);
}

/**
 * Calculates the remaining work hours, given the start time of the work day.
 * @param {string} workStart - Start of work timestamp string in HH:mm:ss format.
 * @param {string} time - Optional timestamp to start counting down from in HH:mm:ss format, if not provided, the current time will be used.
 * @returns An object with properties `hours`, `minutes`, and `seconds` representing the remaining time.
 */
export function getRemainingWorkHours(workStart: string, time?: string) {
  if (!time) {
    time = dayjs().format('HH:mm:ss');
  }

  const startTime = convertTimeTodayToDayjs(workStart);
  const endTime = startTime.add(FULL_DAY_WORK_HOURS + LUNCH_HOURS, 'hours');
  const convertedTime = convertTimeTodayToDayjs(time);

  const totalSeconds = endTime.diff(convertedTime, 'seconds');

  if (totalSeconds <= 0 || !convertedTime.isBetween(startTime, endTime)) {
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
