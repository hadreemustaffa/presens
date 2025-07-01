'use client';

import { ArrowRightFromLine, Coffee } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { lunchIn, lunchOut } from '@/actions/dashboard/actions';
import ClockOutForm from '@/components/forms/clock-out-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ActionState } from '@/lib/middleware';
import { AttendanceRecord } from '@/lib/types/interfaces';

export default function QuickActions(record: AttendanceRecord) {
  const [open, setOpen] = useState(false);

  const [lunchOutState, lunchOutAction, lunchOutPending] = useActionState<ActionState, FormData>(lunchOut, {
    error: '',
    success: '',
  });
  const [lunchInState, lunchInAction, lunchInPending] = useActionState<ActionState, FormData>(lunchIn, {
    error: '',
    success: '',
  });

  useEffect(() => {
    if (lunchOutState?.error || lunchInState?.error) {
      toast.error('An error has occurred', {
        description: lunchOutState.error || lunchInState.error,
        action: { label: 'Close', onClick: () => {} },
      });
    }
  }, [lunchInState, lunchOutState]);

  useEffect(() => {
    if (record.clock_out) setOpen(false);
  }, [record.clock_out]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Card className="flex flex-col gap-4 rounded-md border p-4">
        <CardTitle>Quick Actions</CardTitle>
        <CardContent className="grid grid-cols-1 justify-between gap-4 px-0 sm:grid-cols-2">
          <DialogTrigger asChild>
            <Button
              size={'lg'}
              className={record.lunch_in || record.clock_out ? 'col-span-2' : ''}
              disabled={lunchOutPending || lunchInPending || record.clock_out !== null}
            >
              <ArrowRightFromLine size={20} />
              {record.clock_out ? 'Clock in again tomorrow' : 'Clock Out'}
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <ClockOutForm {...record} />
          </DialogContent>

          {!record.clock_out &&
            (record.lunch_out ? (
              !record.lunch_in && (
                <form>
                  <Button
                    variant={'outline'}
                    size={'lg'}
                    formAction={lunchInAction}
                    className="w-full"
                    disabled={lunchInPending}
                  >
                    <Coffee size={20} className="text-blue-500" />
                    Lunch In
                  </Button>
                </form>
              )
            ) : (
              <form>
                <Button
                  variant={'outline'}
                  size={'lg'}
                  formAction={lunchOutAction}
                  className="w-full"
                  disabled={lunchOutPending}
                >
                  <Coffee size={20} className="text-yellow-500" />
                  Lunch Out
                </Button>
              </form>
            ))}
        </CardContent>
      </Card>
    </Dialog>
  );
}
