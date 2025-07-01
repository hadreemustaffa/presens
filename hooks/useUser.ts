import { User } from '@supabase/supabase-js';
import useSWR from 'swr';

import { createClient } from '@/lib/supabase/client';

const fetchUser = async (): Promise<User | null> => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user ?? null;
};

export function useUser() {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR('/user', fetchUser, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    user,
    isLoading,
    isError: !!error,
    mutate, // for revalidation if needed
  };
}
