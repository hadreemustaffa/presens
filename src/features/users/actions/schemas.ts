import { z } from 'zod';

import { Departments } from '@/features/shared/model/enums';

export const updateBasicInformationSchema = z.object({
  full_name: z.string().min(3, { message: 'Full name must be at least 3 characters' }),
  department: z.nativeEnum(Departments),
});

export const updateEmailSchema = z.object({
  email: z.string().email().min(3, { message: 'Email must be at least 3 characters' }).max(255),
});

export const updatePasswordSchema = z
  .object({
    new_password: z.string().min(8, { message: 'Password must be at least 8 characters' }).max(100),
    confirm_password: z.string().min(8, { message: 'Password must be at least 8 characters' }).max(100),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });
