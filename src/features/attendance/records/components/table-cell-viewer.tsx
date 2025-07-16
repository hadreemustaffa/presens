import { Row } from '@tanstack/react-table';
import { useActionState, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { editRecord } from '@/features/attendance/records/actions/actions';
import { AttendanceRecord, AttendanceRecordWithUserDetails } from '@/features/attendance/records/model/interfaces';
import { WorkMode } from '@/features/shared/model/enums';
import { useIsMobile } from '@/hooks/use-mobile';
import { ActionState } from '@/lib/middleware';
import { capitalizeFirstLetter, formatTimeForDatabase, formatTimeForDisplay } from '@/lib/utils';

export default function TableCellViewer(row: Row<AttendanceRecord | AttendanceRecordWithUserDetails>) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const isMobile = useIsMobile();
  const { mutate } = useSWRConfig();

  const [state, action, pending] = useActionState<ActionState, FormData>(editRecord, {
    error: '',
    success: '',
  });

  const clockIn = formatTimeForDisplay(row.getValue('clock_in'), 'HH:mm');
  const clockOut = formatTimeForDisplay(row.getValue('clock_out'), 'HH:mm');
  const lunchIn = formatTimeForDisplay(row.getValue('lunch_in'), 'HH:mm');
  const lunchOut = formatTimeForDisplay(row.getValue('lunch_out'), 'HH:mm');

  const originalValues = useMemo(
    () => ({
      clock_in: clockIn,
      clock_out: clockOut,
      lunch_in: lunchIn,
      lunch_out: lunchOut,
      work_mode: row.getValue('work_mode') as string,
    }),
    [clockIn, clockOut, lunchIn, lunchOut, row],
  );

  const hasChanges = (formData: FormData) => {
    const currentValues = {
      clock_in: formData.get('clock_in') as string,
      clock_out: formData.get('clock_out') as string,
      lunch_in: formData.get('lunch_in') as string,
      lunch_out: formData.get('lunch_out') as string,
      work_mode: formData.get('work_mode') as string,
    };

    return Object.keys(originalValues).some((key) => {
      const originalValue = originalValues[key as keyof typeof originalValues];
      const currentValue = currentValues[key as keyof typeof currentValues];
      const hasChanged = originalValue !== currentValue;

      return hasChanged;
    });
  };

  const handleAction = async (formData: FormData) => {
    if (!hasChanges(formData)) {
      setOpenDrawer(false);
      return;
    }

    const timeFields = ['clock_in', 'clock_out', 'lunch_in', 'lunch_out'];

    timeFields.forEach((field) => {
      const timeValue = formData.get(field) as string;
      const workDate = formData.get('work_date') as string;

      if (timeValue) {
        const utcDateTime = formatTimeForDatabase(timeValue, workDate);
        formData.set(field, utcDateTime);
      }
    });

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
      setOpenDrawer(false);

      mutate((key) => Array.isArray(key) && key[0] === 'attendance-records', undefined, { revalidate: true });
    }
  }, [mutate, state]);

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'} open={openDrawer} onOpenChange={setOpenDrawer}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {row.getValue('full_name')}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Edit employee record</DrawerTitle>
          <DrawerDescription>Review the information, make edits, and save.</DrawerDescription>
        </DrawerHeader>
        <form id="edit-record-form" className="flex flex-col gap-4 p-4" action={handleAction}>
          <input type="hidden" name="work_date" value={row.original.work_date} />
          <input type="hidden" name="employee_id" value={row.original.employee_id} />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="clock_in">Clock In</Label>
              <Input
                id="clock_in"
                name="clock_in"
                type="time"
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                defaultValue={clockIn}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="lunch_out">Lunch Out</Label>
              <Input
                id="lunch_out"
                name="lunch_out"
                type="time"
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                defaultValue={lunchOut}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="lunch_in">Lunch In</Label>
              <Input
                id="lunch_in"
                name="lunch_in"
                type="time"
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                defaultValue={lunchIn}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="clock_out">Clock Out</Label>
              <Input
                id="clock_out"
                name="clock_out"
                type="time"
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                defaultValue={clockOut}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="work_mode">Work Mode</Label>
            <Select name="work_mode" defaultValue={row.getValue('work_mode')}>
              <SelectTrigger id="work_mode" className="w-full">
                <SelectValue placeholder="Select work mode" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(WorkMode).map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {capitalizeFirstLetter(mode)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>

        <DrawerFooter>
          <Button type="submit" form="edit-record-form" disabled={pending}>
            {pending ? 'Saving...' : 'Save'}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
