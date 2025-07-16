import { Row } from '@tanstack/react-table';
import { EllipsisVertical } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deleteRecord, editRemarks } from '@/features/attendance/records/actions/actions';
import { AttendanceRecord, AttendanceRecordWithUserDetails } from '@/features/attendance/records/model/interfaces';
import { Remarks } from '@/features/shared/model/enums';
import { ActionState } from '@/lib/middleware';

export function setRemarkColor(remark: Remarks) {
  switch (remark) {
    case Remarks.EmergencyLeave:
      return 'rounded-sm border p-1 bg-red-500/25';
    case Remarks.AMLeave:
      return 'rounded-sm border p-1 bg-blue-500/25';
    case Remarks.PMLeave:
      return 'rounded-sm border p-1 bg-green-500/25';
    default:
      return 'rounded-sm border p-1 bg-accent/25';
  }
}

export function RowMenuUser(row: Row<AttendanceRecord | AttendanceRecordWithUserDetails>) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [remarks, setRemarks] = useState<Remarks[keyof Remarks]>();
  const { mutate } = useSWRConfig();

  const [state, action, pending] = useActionState<ActionState, FormData>(editRemarks, {
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
      setOpenDrawer(false);

      mutate((key) => Array.isArray(key) && key[0] === 'attendance-records', undefined, { revalidate: true });
    }
  }, [mutate, state]);

  const handleOpenDrawer = () => {
    setOpenDrawer(!openDrawer);
    setRemarks('');
  };

  return (
    <Dialog open={openDrawer} onOpenChange={handleOpenDrawer}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <EllipsisVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DialogTrigger asChild>
            <DropdownMenuItem>Edit Remarks</DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <form className="flex flex-col gap-4" action={action}>
          <input type="hidden" name="work_date" value={row.original.work_date} />
          <input type="hidden" name="employee_id" value={row.original.employee_id} />

          <DialogHeader>
            <DialogTitle>Edit remarks</DialogTitle>
            <DialogDescription>Make your changes and save.</DialogDescription>
          </DialogHeader>

          <div className="text-sm">
            <p className="mb-3 font-medium">Previous remarks</p>
            <p className={`${setRemarkColor(row.getValue('remarks'))} w-fit`}>{row.getValue('remarks') ?? '-'}</p>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="remarks">Remarks</Label>
            <Select name="remarks" disabled={pending} onValueChange={setRemarks}>
              <SelectTrigger id="remarks" className="w-full">
                <SelectValue placeholder="Select a remark" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Remarks).map((remark) => (
                  <SelectItem key={remark} value={remark}>
                    {remark}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {remarks === Remarks.SpecifyOtherRemark && (
              <Input
                type="text"
                name="other_remarks"
                placeholder="e.g. doctor’s appointment"
                disabled={pending}
                autoComplete="off"
                required
              />
            )}
          </div>

          <DialogFooter className="sm:flex-col-reverse">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RowMenuAdmin(row: Row<AttendanceRecord | AttendanceRecordWithUserDetails>) {
  const [openDialog, setOpenDialog] = useState(false);
  const { mutate } = useSWRConfig();

  const [state, action, pending] = useActionState<ActionState, FormData>(deleteRecord, {
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <EllipsisVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DialogTrigger asChild>
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <form className="flex flex-col gap-4" action={action}>
          <input type="hidden" name="id" value={row.original.id} />

          <DialogHeader>
            <DialogTitle>Delete this record</DialogTitle>
            <DialogDescription>Are you sure you want to delete this record?</DialogDescription>
          </DialogHeader>

          <ul className="flex flex-col flex-wrap gap-4 rounded-md border p-4 text-sm">
            <li className="flex items-center gap-2">
              <p className="text-xs">Name:</p>
              <p className="font-medium">{row.getValue('full_name')}</p>
            </li>
            <li className="flex items-center gap-2">
              <p className="text-xs">Date:</p>
              <p className="font-medium">{row.getValue('work_date')}</p>
            </li>
          </ul>

          <DialogFooter className="sm:flex-row">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
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
