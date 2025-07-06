import { useCountdownTimer } from '@/hooks/use-countdown-timer';
import { CountdownTimerProps } from '@/lib/types/interfaces';

export const CountdownTimer = ({ startTime, workDate, onComplete }: CountdownTimerProps) => {
  const { hours, minutes, seconds } = useCountdownTimer({ startTime, workDate, onComplete });

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  return (
    <div className="text-xs">
      <p>
        Time left until work hours end:{' '}
        <span className="font-semibold">
          {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
        </span>
      </p>
    </div>
  );
};
