import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LUNCH_HOURS, FULL_DAY_WORK_HOURS } from '@/lib/constants';
import { getRemainingWorkHours } from '@/lib/utils';

dayjs.extend(isBetween);

describe('getRemainingWorkHours', () => {
  const testWorkDate = '2024-01-15';
  const totalWorkHours = FULL_DAY_WORK_HOURS + LUNCH_HOURS;

  describe('when time parameter is provided', () => {
    it('should return correct remaining hours for mid-day work', () => {
      const result = getRemainingWorkHours('2024-01-15 09:00:00+8:00', '2024-01-15 15:00:00+8:00');

      expect(result).toEqual({
        hours: 3,
        minutes: 0,
        seconds: 0,
      });
    });

    it('should return zero when work day is over', () => {
      const result = getRemainingWorkHours('2024-01-15 09:00:00+8:00');

      expect(result).toEqual({
        hours: 0,
        minutes: 0,
        seconds: 0,
      });
    });

    it('should return zero when current time is before work start', () => {
      // Work starts at 9:00 AM, current time is 8:00 AM
      const result = getRemainingWorkHours('2024-01-15 09:00:00+8:00', testWorkDate);

      expect(result).toEqual({
        hours: 0,
        minutes: 0,
        seconds: 0,
      });
    });

    it('should handle minutes and seconds correctly', () => {
      const result = getRemainingWorkHours('2024-01-15 09:00:00+8:00', '2024-01-15 10:05:10+8:00');

      expect(result).toEqual({
        hours: 7,
        minutes: 54,
        seconds: 50,
      });
    });
  });

  describe('when time parameter is not provided', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should use current time when no time parameter provided', () => {
      // Set current time to 3:00 PM on the same work date
      vi.setSystemTime(new Date(`${testWorkDate} 15:00:00`));

      const result = getRemainingWorkHours('2024-01-15 09:00:00+8:00');

      // At 15:00, with work starting at 09:00
      // 6 hours have passed, so remaining including lunch = 9 - 6 = 3 hours
      expect(result.hours).toBe(3);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle exactly at work start time', () => {
      const result = getRemainingWorkHours('2024-01-15 09:00:00+8:00', '2024-01-15 09:00:00+8:00');

      expect(result).toEqual({
        hours: totalWorkHours,
        minutes: 0,
        seconds: 0,
      });
    });

    it('should handle exactly at work end time', () => {
      const result = getRemainingWorkHours('2024-01-15 18:00:00+8:00');

      expect(result).toEqual({
        hours: 0,
        minutes: 0,
        seconds: 0,
      });
    });
  });

  describe('boundary conditions', () => {
    it('should handle very small remaining time', () => {
      // 1 second before work ends
      const result = getRemainingWorkHours('2024-01-15 09:00:00+8:00', '2024-01-15 17:59:59+8:00');

      expect(result).toEqual({
        hours: 0,
        minutes: 0,
        seconds: 1,
      });
    });
  });
});
