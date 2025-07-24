'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import { ErrorMessage } from '@/components/error-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/features/auth/actions/actions';
import { useUser } from '@/features/users/hooks/use-user';
import { ActionState } from '@/lib/middleware';
import { cn } from '@/lib/utils';

export function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
  const { mutate } = useUser();
  const [state, formAction, pending] = useActionState<ActionState, FormData>(login, { error: '', success: '' });

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
      mutate();
      redirect('/dashboard');
    }
  }, [mutate, state]);

  return (
    <form action={formAction} className={cn('flex flex-col gap-6', className)} {...props}>
      <h1 className="text-center text-2xl font-bold">Log in to your account</h1>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={state.email}
            placeholder="m@example.com"
            disabled={pending}
            required
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="ml-auto text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            defaultValue={state.password}
            disabled={pending}
            required
          />
        </div>

        {state.error && <ErrorMessage>{state.error}</ErrorMessage>}

        <Button type="submit" className="w-full hover:cursor-pointer" disabled={pending}>
          {pending ? 'Loading...' : 'Login'}
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/auth/sign-up" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </form>
  );
}
