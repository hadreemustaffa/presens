import { z } from 'zod';

import { Remarks, WorkMode } from '@/features/shared/model/enums';

export const clockOutSchema = z.object({
  remark: z
    .union([z.nativeEnum(Remarks), z.literal('')])
    .optional()
    .transform((val) => (val === '' ? null : (val as Remarks))),
  other_remark: z.string().min(2).max(100).optional(),
});

export const editRemarksSchema = z.object({
  work_date: z.string(),
  employee_id: z.string(),
  remarks: z
    .union([z.nativeEnum(Remarks), z.literal('')])
    .optional()
    .transform((val) => (val === '' ? null : (val as Remarks))),
  other_remarks: z.string().min(2).max(100).optional(),
});

export const editRecordSchema = z.object({
  employee_id: z.string(),
  clock_in: z.string().datetime(),
  lunch_out: z.string().datetime(),
  lunch_in: z.string().datetime(),
  clock_out: z.string().datetime(),
  work_date: z.string(),
  work_mode: z.nativeEnum(WorkMode),
});

export const deleteRecordSchema = z.object({
  id: z.coerce.number(),
});

export const deleteMultipleRecordsSchema = z.object({
  ids: z
    .string()
    .transform((val) => val.split(','))
    .pipe(z.array(z.coerce.number().min(1))),
});
