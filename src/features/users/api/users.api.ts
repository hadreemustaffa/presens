import { redirect } from 'next/navigation';
import { cache } from 'react';

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

export const getActiveUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/');
  }

  const isAdmin = user.user_metadata.user_role === 'admin';

  return {
    user,
    isAdmin,
  };
});
