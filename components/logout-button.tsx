'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    // prevent double-clicks
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error);
        setIsLoggingOut(false);
        return;
      }

      router.refresh();

      // small delay to ensure session is fully cleared
      setTimeout(() => {
        router.push('/');
      }, 100);
    } catch (error) {
      console.error('Unexpected logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <Button onClick={logout} disabled={isLoggingOut} className="hover:cursor-pointer disabled:opacity-50">
      {isLoggingOut ? 'Loading...' : 'Logout'}
    </Button>
  );
}
