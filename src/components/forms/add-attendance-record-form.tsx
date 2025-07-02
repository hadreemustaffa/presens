'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { clockInHome, clockInOffice } from '@/features/attendance/records/actions/actions';
import { ActionState } from '@/lib/middleware';

export default function AddAttendanceRecordForm() {
  const [homeState, homeAction, homePending] = useActionState<ActionState, FormData>(clockInHome, {
    error: '',
    success: '',
  });
  const [officeState, officeAction, officePending] = useActionState<ActionState, FormData>(clockInOffice, {
    error: '',
    success: '',
  });

  useEffect(() => {
    if (homeState?.error || officeState?.error) {
      toast.error('An error has occurred', {
        description: homeState.error || officeState.error,
        action: { label: 'Close', onClick: () => {} },
      });
    }
  }, [homeState, officeState]);

  return (
    <form className="mx-auto flex h-full max-w-xl flex-col justify-center gap-8 p-4">
      <div className="flex w-full flex-col items-center gap-4">
        <p className="text-sm">Select work mode and clock in</p>
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <Button formAction={homeAction} className="w-full hover:cursor-pointer" disabled={homePending}>
            Home
          </Button>
          <Button formAction={officeAction} className="w-full hover:cursor-pointer" disabled={officePending}>
            Office
          </Button>
        </div>
      </div>
    </form>
  );
}
