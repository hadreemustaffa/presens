import { Table } from '@tanstack/react-table';
import { Trash } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteMultipleRecords } from '@/features/attendance/records/actions/actions';
import { AttendanceRecord, AttendanceRecordWithUserDetails } from '@/features/attendance/records/model/interfaces';
import { ActionState } from '@/lib/middleware';

export default function MultiSelectDeleteButton(table: Table<AttendanceRecord | AttendanceRecordWithUserDetails>) {
  const [openDialog, setOpenDialog] = useState(false);
  const { mutate } = useSWRConfig();

  const [state, action, pending] = useActionState<ActionState, FormData>(deleteMultipleRecords, {
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
      setOpenDialog(false);

      mutate((key) => Array.isArray(key) && key[0] === 'attendance-records', undefined, { revalidate: true });
    }
  }, [mutate, state]);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button variant={'outline'} size={'sm'} className="text-destructive/75 hover:text-destructive max-w-sm">
          <Trash />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form className="flex flex-col gap-4" action={action}>
          <input
            type="hidden"
            name="ids"
            value={table
              .getSelectedRowModel()
              .rows.map((row) => row.original.id)
              .join(',')}
          />

          <DialogHeader>
            <DialogTitle>Delete these records</DialogTitle>
            <DialogDescription>Are you sure you want to delete these records?</DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:flex-row">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button variant={'destructive'} type="submit" disabled={pending}>
              {pending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
