'use client';

import { LoaderCircle } from 'lucide-react';
import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import { ErrorMessage } from '@/components/error-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePassword } from '@/features/users/actions/actions';
import { ActionState } from '@/lib/middleware';

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(updatePassword, {
    error: '',
    success: '',
  });

  useEffect(() => {
    if (state?.error) {
      toast.error('An error has occurred', {
        description: state.error,
        action: { label: 'Close', onClick: () => {} },
      });
    }
  }, [state]);

  useEffect(() => {
    if (state?.success) {
      toast.success('Success!', {
        description: state.success,
        action: { label: 'Close', onClick: () => {} },
      });
    }
  }, [state]);

  return (
    <div className="flex max-w-3xl flex-col gap-6 py-6 @[768px]/main:w-xl">
      <div className="basis-1/2">
        <h2 className="text-xl font-bold">Change Password</h2>
        <p className="text-sm">Update your password to keep your account secure.</p>
      </div>
      <form className="flex basis-1/2 flex-col gap-4" action={action}>
        <div className="flex flex-col gap-3 @[768px]/main:grid @[768px]/main:grid-cols-3">
          <Label htmlFor="new_password">New Password</Label>
          <Input
            id="new_password"
            name="new_password"
            type="password"
            className="col-span-2"
            disabled={pending}
            required
          />
        </div>
        <div className="flex flex-col gap-3 @[768px]/main:grid @[768px]/main:grid-cols-3">
          <Label htmlFor="confirm_password">Confirm Password</Label>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            className="col-span-2"
            disabled={pending}
            required
          />
        </div>

        {state.error && <ErrorMessage>{state.error}</ErrorMessage>}

        <Button type="submit" className="w-fit place-self-end hover:cursor-pointer" disabled={pending}>
          {pending ? (
            <>
              Changing Password
              <LoaderCircle className="animate-spin" />
            </>
          ) : (
            'Change Password'
          )}
        </Button>
      </form>
    </div>
  );
}
