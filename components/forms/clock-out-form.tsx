import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { clockOut } from '@/actions/dashboard/actions';
import { CountdownTimer } from '@/components/countdown-timer';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActionState } from '@/lib/middleware';
import { Remarks } from '@/types/enums';
import { AttendanceRecord } from '@/types/interfaces';

export default function ClockOutForm(record: AttendanceRecord) {
  const [remark, setRemark] = useState<Remarks[keyof Remarks]>();

  const [state, action, pending] = useActionState<ActionState, FormData>(clockOut, {
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
  }, [state?.success]);

  return (
    <form className="flex flex-col gap-4" action={action}>
      <DialogHeader>
        <DialogTitle>Clock out</DialogTitle>
        <DialogDescription>Please include a remark if you have any.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-3">
        <Label htmlFor="remark">Remark</Label>
        <Select name="remark" disabled={pending} onValueChange={setRemark}>
          <SelectTrigger id="remark" className="w-full">
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
        {remark === Remarks.SpecifyOtherRemark && (
          <Input
            type="text"
            name="other_remark"
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
        <Button type="submit" className="flex flex-col" disabled={pending}>
          Proceed to clock out
        </Button>
        {record.clock_in && <CountdownTimer startTime={record.clock_in} />}
      </DialogFooter>
    </form>
  );
}
