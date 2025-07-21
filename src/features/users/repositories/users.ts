import { SupabaseClient } from '@supabase/supabase-js';

type UpdatesFormData = { [key: string]: string } | { data: { [key: string]: string } };

export class UsersRepository {
  constructor(private supabase: SupabaseClient) {}

  async updateUser(updates: UpdatesFormData): Promise<{ error: unknown }> {
    return await this.supabase.auth.updateUser(updates);
  }
}
