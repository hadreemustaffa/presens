import { clsx, type ClassValue } from 'clsx';
import dayjs from 'dayjs';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns a string representing the time of day.
 * @param {Object} param - An object with one property, `abbreviate`, which is a boolean.
 * @param {boolean} param.abbreviate - If true, returns 'AM' or 'PM'. If false, returns 'morning', 'afternoon', or 'evening'.
 * @returns A string representing the time of day.
 */
export function getTimeOfDay({ abbreviate }: { abbreviate: boolean }) {
  const now = new Date();
  const hours = now.getHours();
  if (hours >= 0 && hours < 12) {
    return abbreviate ? 'AM' : 'morning';
  } else if (hours >= 12 && hours < 18) {
    return abbreviate ? 'AM' : 'afternoon';
  } else {
    return abbreviate ? 'PM' : 'evening';
  }
}

export const formatTime = (timestamp: string, format: string) => {
  return dayjs(timestamp).format(`${format}`);
};
