import { redirect } from 'next/navigation';
import { cache } from 'react';

import { createClient } from '@/lib/supabase/server';

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
