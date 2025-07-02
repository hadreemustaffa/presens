import { UserMetadata } from '@/features/users/model/interfaces';
import { createClient } from '@/lib/supabase/server';

export const getUsers = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase.from('users').select('*');

  if (error) {
    console.error(error);
  }

  return data as UserMetadata[];
};
