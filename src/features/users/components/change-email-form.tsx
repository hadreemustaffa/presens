'use client';

import { Info, LoaderCircle } from 'lucide-react';
import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import { ErrorMessage } from '@/components/error-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateEmail } from '@/features/users/actions/actions';
import { ActionState } from '@/lib/middleware';

export default function ChangeEmailForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateEmail, {
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
    <div className="flex max-w-3xl flex-col gap-6 border-b py-6 @[768px]/main:w-xl">
      <div>
        <h2 className="text-xl font-bold">Change Email</h2>
        <p className="text-sm">Update the email address associated with your account.</p>
      </div>
      <form className="flex flex-col gap-4" action={action}>
        <div className="flex flex-col gap-3 @[768px]/main:grid @[768px]/main:grid-cols-3">
          <Label htmlFor="email">New Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            className="col-span-2"
            autoComplete="off"
            disabled={pending}
            required
          />
        </div>

        <div className="bg-card flex items-center gap-2 rounded-md border p-2 text-xs">
          <Info />
          <p>A confirmation email will be sent to both your current and new addresses for verification.</p>
        </div>

        {state.error && <ErrorMessage>{state.error}</ErrorMessage>}

        <Button type="submit" className="w-fit place-self-end hover:cursor-pointer" disabled={pending}>
          {pending ? (
            <>
              Sending confirmation
              <LoaderCircle className="animate-spin" />
            </>
          ) : (
            'Send confirmation'
          )}
        </Button>
      </form>
    </div>
  );
}
