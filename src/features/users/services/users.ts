import { revalidatePath } from 'next/cache';

import { handleDatabaseError } from '@/features/shared/lib/utils';
import { Departments } from '@/features/shared/model/enums';
import { ActionResult } from '@/features/shared/model/interfaces';
import { UsersRepository } from '@/features/users/repositories/users';
import { SETTINGS_PATH } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';

export class UsersService {
  constructor(private repository: UsersRepository) {}

  async updateBasicInformation(data: { full_name: string; department: Departments }): Promise<ActionResult> {
    const updates = {
      data: {
        full_name: data.full_name,
        department: data.department,
      },
    };

    const { error } = await this.repository.updateUser(updates);

    if (error) {
      return handleDatabaseError(error, 'Failed to update your information.');
    }

    revalidatePath(SETTINGS_PATH);
    return { success: 'Your information have been updated.' };
  }

  async updateEmail(email: string): Promise<ActionResult> {
    const { error } = await this.repository.updateUser({ email: email });

    if (error) {
      return handleDatabaseError(error, 'Failed to send confirmation email.');
    }

    return { success: 'A confirmation email has been sent.' };
  }

  async updatePassword(new_password: string): Promise<ActionResult> {
    const { error } = await this.repository.updateUser({ password: new_password });

    if (error) {
      return handleDatabaseError(error, 'Failed to update your password.');
    }

    revalidatePath(SETTINGS_PATH);
    return { success: 'Your password have been updated.' };
  }
}

export const createUsersService = async (): Promise<UsersService> => {
  const supabase = await createClient();
  const repository = new UsersRepository(supabase);
  return new UsersService(repository);
};
