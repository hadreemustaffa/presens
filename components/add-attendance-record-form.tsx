'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import { clockInHome, clockInOffice } from '@/actions/dashboard/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ActionState } from '@/lib/middleware';
import { getTimeOfDay } from '@/lib/utils';
import { UserMetadata } from '@/types/interfaces';

export default function AddAttendanceRecordForm(user: UserMetadata) {
  const [homeState, homeAction, homePending] = useActionState<ActionState, FormData>(clockInHome, { error: '' });
  const [officeState, officeAction, officePending] = useActionState<ActionState, FormData>(clockInOffice, {
    error: '',
  });

  const timeOfDay = getTimeOfDay({ abbreviate: false });

  useEffect(() => {
    if (homeState.error || officeState.error) {
      toast.error('An error has occurred', {
        description: homeState.error || officeState.error,
        action: { label: 'Close', onClick: () => {} },
      });
    }
  }, [homeState, officeState]);

  return (
    <form className="mx-auto flex h-full max-w-xl flex-col justify-center gap-8 p-4">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-xl">Good {timeOfDay},</h2>
        <h2 className="text-2xl font-bold">{user.full_name}</h2>
      </div>

      <div className="flex w-full flex-col items-center gap-4">
        <p className="text-sm">Select work mode and clock in</p>
        <div className="flex w-full items-center justify-center gap-4">
          <Button formAction={homeAction} className="flex-1 hover:cursor-pointer" disabled={homePending}>
            Home
          </Button>
          <Button formAction={officeAction} className="flex-1 hover:cursor-pointer" disabled={officePending}>
            Office
          </Button>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-4">
        <p className="text-sm">or if you are on leave</p>
        <div className="flex w-full items-center">
          <Input
            id="leave-reason"
            name="leave-reason"
            type="text"
            className="rounded-tr-none rounded-br-none"
            placeholder="e.g AL/MC/Emergency"
            autoComplete="off"
            disabled={homePending || officePending}
          />
          <Button
            variant={'secondary'}
            className="rounded-tl-none rounded-bl-none"
            disabled={homePending || officePending}
          >
            Take Leave
          </Button>
        </div>
      </div>
    </form>
  );
}
