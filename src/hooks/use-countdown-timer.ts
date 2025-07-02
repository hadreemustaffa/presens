import { useState, useEffect } from 'react';

import { CountdownTimerProps } from '@/lib/types/interfaces';
import { getRemainingWorkHours } from '@/lib/utils';

export const useCountdownTimer = ({ startTime, onComplete }: CountdownTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(() => getRemainingWorkHours(startTime));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getRemainingWorkHours(startTime);
      setTimeRemaining(remaining);

      // Clear interval and call onComplete when time is up
      if (remaining.hours === 0 && remaining.minutes === 0 && remaining.seconds === 0) {
        clearInterval(interval);
        if (onComplete) {
          onComplete();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, onComplete]);

  return timeRemaining;
};
