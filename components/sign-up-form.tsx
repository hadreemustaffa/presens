'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { signup } from '@/app/auth/actions';
import { ErrorMessage } from '@/components/error-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActionState } from '@/lib/auth/middleware';
import { cn } from '@/lib/utils';
import { Departments } from '@/types/enums';

export function SignUpForm({ className, ...props }: React.ComponentProps<'form'>) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(signup, { error: '' });

  return (
    <form action={formAction} className={cn('flex flex-col gap-6', className)} {...props}>
      <h1 className="text-center text-2xl font-bold">Create your account</h1>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            defaultValue={state.fullName}
            placeholder="John Doe"
            disabled={pending}
            required
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={state.email}
            placeholder="m@example.com"
            autoComplete="off"
            disabled={pending}
            required
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            disabled={pending}
            required
          />
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" disabled={pending} required />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-3">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              name="employeeId"
              type="text"
              defaultValue={state.employeeId}
              placeholder="H12C34"
              disabled={pending}
              required
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="department">Department</Label>
            <Select name="department" disabled={pending}>
              <SelectTrigger id="department" className="w-full">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(Departments).map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {state.error && <ErrorMessage>{state.error}</ErrorMessage>}

        <Button type="submit" className="w-full hover:cursor-pointer" disabled={pending}>
          {pending ? 'Loading...' : 'Sign Up'}
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link href="/" className="underline underline-offset-4">
          Log In
        </Link>
      </div>
    </form>
  );
}
