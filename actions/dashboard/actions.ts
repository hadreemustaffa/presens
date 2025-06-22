'use server';

import dayjs from 'dayjs';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getActiveUser } from '@/api/dashboard';
import { validatedAction } from '@/lib/middleware';
import { createClient } from '@/lib/supabase/server';
import { Remarks, WorkMode } from '@/types/enums';

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

const editRemarksSchema = z.object({
  work_date: z.string(),
  employee_id: z.string(),
  remarks: z
    .union([z.nativeEnum(Remarks), z.literal('')])
    .optional()
    .transform((val) => (val === '' ? null : (val as Remarks))),
  other_remarks: z.string().min(2).max(100).optional(),
});

export const editRemarks = validatedAction(editRemarksSchema, async (data) => {
  const supabase = await createClient();

  const { work_date, employee_id, remarks, other_remarks } = data;

  const { error } = await supabase
    .from('attendance_records')
    .update({
      remarks: other_remarks ?? remarks,
    })
    .eq('employee_id', employee_id)
    .eq('work_date', work_date);

  if (error) {
    console.log(error);

    return {
      error: 'Failed to save new remarks. Please try again.',
    };
  }

  revalidatePath('/dashboard/records', 'page');
  return {
    success: 'New remarks have been saved.',
  };
});

const editRecordSchema = z.object({
  employee_id: z.string(),
  clock_in: z.string().time(),
  lunch_out: z.string().time(),
  lunch_in: z.string().time(),
  clock_out: z.string().time(),
  work_date: z.string(),
  work_mode: z.nativeEnum(WorkMode),
});

export const editRecord = validatedAction(editRecordSchema, async (data) => {
  const supabase = await createClient();

  const { employee_id, clock_in, lunch_out, lunch_in, clock_out, work_date, work_mode } = data;

  const { error } = await supabase
    .from('attendance_records')
    .update({
      clock_in,
      lunch_out,
      lunch_in,
      clock_out,
      work_mode,
    })
    .eq('employee_id', employee_id)
    .eq('work_date', work_date);

  if (error) {
    console.log(error);

    return {
      error: 'Failed to edit record. Please try again.',
    };
  }

  revalidatePath('/dashboard/records', 'page');
  return {
    success: 'Record has been edited.',
  };
});

const deleteRecordSchema = z.object({
  id: z.coerce.number(),
});

export const deleteRecord = validatedAction(deleteRecordSchema, async (data) => {
  const supabase = await createClient();

  const { id } = data;

  const { error } = await supabase.from('attendance_records').delete().eq('id', id);

  if (error) {
    console.log(error);

    return {
      error: 'Failed to delete record. Please try again.',
    };
  }

  revalidatePath('/dashboard/records', 'page');
});

const deleteMultipleRecordsSchema = z.object({
  ids: z
    .string()
    .transform((val) => val.split(','))
    .pipe(z.array(z.coerce.number().min(1))),
});

export const deleteMultipleRecords = validatedAction(deleteMultipleRecordsSchema, async (data) => {
  const supabase = await createClient();

  const { ids } = data;

  const { error } = await supabase.from('attendance_records').delete().in('id', ids);

  if (error) {
    console.log(error);

    return {
      error: 'Failed to delete selected records. Please try again.',
    };
  }

  revalidatePath('/dashboard/records', 'page');
});
