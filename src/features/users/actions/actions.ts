'use server';

import {
  updateBasicInformationSchema,
  updateEmailSchema,
  updatePasswordSchema,
} from '@/features/users/actions/schemas';
import { createUsersService } from '@/features/users/services/users';
import { validatedAction } from '@/lib/middleware';

export const updateBasicInformation = validatedAction(updateBasicInformationSchema, async (data) => {
  const service = await createUsersService();
  return service.updateBasicInformation(data);
});

export const updateEmail = validatedAction(updateEmailSchema, async (data) => {
  const service = await createUsersService();
  const { email } = data;
  return service.updateEmail(email);
});

export const updatePassword = validatedAction(updatePasswordSchema, async (data) => {
  const service = await createUsersService();
  const { new_password } = data;
  return service.updatePassword(new_password);
});
