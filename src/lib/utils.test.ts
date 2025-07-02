import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LUNCH_HOURS, FULL_DAY_WORK_HOURS } from '@/lib/constants';
import { getRemainingWorkHours } from '@/lib/utils';

dayjs.extend(isBetween);

describe('getRemainingWorkHours', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    vi.clearAllMocks();
  });

  describe('when time parameter is provided', () => {
    it('should return correct remaining hours', () => {
      const result = getRemainingWorkHours('09:00:00', '15:00:00');

      expect(result).toEqual({
        hours: 3,
        minutes: 0,
        seconds: 0,
      });
    });

    it('should return zero when work day is over', () => {
      const result = getRemainingWorkHours('09:00:00', '19:00:00');

      expect(result).toEqual({
        hours: 0,
        minutes: 0,
        seconds: 0,
      });
    });

    it('should return zero when current time is before work start', () => {
      const result = getRemainingWorkHours('09:00:00', '08:00:00');

      expect(result).toEqual({
        hours: 0,
        minutes: 0,
        seconds: 0,
      });
    });

    it('should handle minutes and seconds correctly', () => {
      const result = getRemainingWorkHours('09:00:00', '09:30:45');

      expect(result).toEqual({
        hours: 8,
        minutes: 29,
        seconds: 15,
      });
    });
  });

  describe('when time parameter is not provided', () => {
    beforeEach(() => {
      // Mock the current time to be consistent
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2023-01-01 14:30:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should use current time when no time parameter provided', () => {
      const result = getRemainingWorkHours('09:00:00');

      // At 14:30, with work day starting at 09:00
      // 5.5 hours have passed, so remaining = (FULL_DAY_WORK_HOURS + LUNCH_HOURS) - 5.5
      const expectedHours = Math.floor(FULL_DAY_WORK_HOURS + LUNCH_HOURS - 5.5);
      const expectedMinutes = 30;

      expect(result.hours).toBe(expectedHours);
      expect(result.minutes).toBe(expectedMinutes);
      expect(result.seconds).toBe(0);
    });
  });

  // Performance test
  describe('performance test', () => {
    it('should execute quickly', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        getRemainingWorkHours('09:00:00', '12:00:00');
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete 1000 calls in under 100ms
    });
  });
});
