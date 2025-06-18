'use server';

import dayjs from 'dayjs';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getActiveUser } from '@/api/dashboard';
import { validatedAction } from '@/lib/middleware';
import { createClient } from '@/lib/supabase/server';
import { Remarks } from '@/types/enums';

export const clockInHome = async () => {
  const supabase = await createClient();
  const { user } = await getActiveUser();

  const { error } = await supabase.from('attendance_records').insert({
    employee_id: user.user_metadata.employee_id,
    clock_in: dayjs().format('HH:mm:ss'),
    work_mode: 'home',
    work_date: dayjs().format('YYYY-MM-DD'),
  });

  if (error) {
    console.log(error);

    return {
      error: 'Failed to clock in. Please try again.',
    };
  }

  revalidatePath('/dashboard', 'layout');
  return { success: true };
};

export const clockInOffice = async () => {
  const supabase = await createClient();
  const { user } = await getActiveUser();

  const { error } = await supabase.from('attendance_records').insert({
    employee_id: user.user_metadata.employee_id,
    clock_in: dayjs().format('HH:mm:ss'),
    work_mode: 'office',
    work_date: dayjs().format('YYYY-MM-DD'),
  });

  if (error) {
    console.log(error);

    return {
      error: 'Failed to clock in. Please try again.',
    };
  }

  revalidatePath('/dashboard', 'layout');
  return { success: true };
};

const clockOutSchema = z.object({
  remark: z
    .union([z.nativeEnum(Remarks), z.literal('')])
    .optional()
    .transform((val) => (val === '' ? null : (val as Remarks))),
  other_remark: z.string().min(2).max(100).optional(),
});

export const clockOut = validatedAction(clockOutSchema, async (data) => {
  const supabase = await createClient();
  const { user } = await getActiveUser();

  const { remark, other_remark } = data;

  const { error } = await supabase
    .from('attendance_records')
    .update({
      clock_out: dayjs().format('HH:mm:ss'),
      remarks: other_remark ?? remark ?? null,
    })
    .eq('employee_id', user.user_metadata.employee_id)
    .eq('work_date', dayjs().format('YYYY-MM-DD'));

  if (error) {
    console.log(error);

    return {
      error: 'Failed to clock out. Please try again.',
    };
  }

  revalidatePath('/dashboard', 'layout');
  return {
    success: 'You have clocked out.',
  };
});

export const lunchOut = async () => {
  const supabase = await createClient();
  const { user } = await getActiveUser();

  const { error } = await supabase
    .from('attendance_records')
    .update({
      lunch_out: dayjs().format('HH:mm:ss'),
    })
    .eq('employee_id', user.user_metadata.employee_id)
    .eq('work_date', dayjs().format('YYYY-MM-DD'));

  if (error) {
    console.log(error);

    return {
      error: 'Failed to lunch out. Please try again.',
    };
  }

  revalidatePath('/dashboard', 'layout');
  return { success: true };
};

export const lunchIn = async () => {
  const supabase = await createClient();
  const { user } = await getActiveUser();

  const { error } = await supabase
    .from('attendance_records')
    .update({
      lunch_in: dayjs().format('HH:mm:ss'),
    })
    .eq('employee_id', user.user_metadata.employee_id);

  if (error) {
    console.log(error);

    return {
      error: 'Failed to lunch in. Please try again.',
    };
  }

  revalidatePath('/dashboard', 'layout');
  return { success: true };
};
