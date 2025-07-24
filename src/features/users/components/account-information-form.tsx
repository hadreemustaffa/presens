'use client';

import { LoaderCircle } from 'lucide-react';
import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import { ErrorMessage } from '@/components/error-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Departments } from '@/features/shared/model/enums';
import { updateBasicInformation } from '@/features/users/actions/actions';
import { UserMetadata } from '@/features/users/model/interfaces';
import { ActionState } from '@/lib/middleware';

export default function AccountInformationForm({
  full_name,
  department,
}: Pick<UserMetadata, 'full_name' | 'department'>) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateBasicInformation, {
    error: '',
    success: '',
  });

  const handleAction = async (formData: FormData) => {
    if (full_name === formData.get('full_name') && department === formData.get('department')) {
      return;
    }

    await action(formData);
  };

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
    <div className="flex max-w-3xl flex-col gap-6 border-b pb-6 @[768px]/main:w-xl">
      <div>
        <h2 className="text-xl font-bold">Account Information</h2>
        <p className="text-sm">View and update your personal details and account information.</p>
      </div>
      <form className="flex flex-col gap-4" action={handleAction}>
        <div className="flex flex-col gap-3 @[768px]/main:grid @[768px]/main:grid-cols-3">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            className="col-span-2"
            defaultValue={full_name}
            disabled={pending}
          />
        </div>

        <div className="grid gap-3">
          <div className="flex flex-col gap-3 @[768px]/main:grid @[768px]/main:grid-cols-3">
            <Label htmlFor="department">Department</Label>
            <Select
              key={department as Departments}
              name="department"
              defaultValue={department as Departments}
              disabled={pending}
            >
              <SelectTrigger id="department" className="col-span-2 w-full">
                <SelectValue />
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

        <Button type="submit" className="w-fit place-self-end hover:cursor-pointer" disabled={pending}>
          {pending ? (
            <>
              Saving Changes
              <LoaderCircle className="animate-spin" />
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>
    </div>
  );
}
