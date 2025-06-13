'use client';

import { Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { LoginForm } from '@/components/login-form';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // automatically redirect if logged in
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.replace('/protected');
      }
    };

    checkAuth();
  }, [router, supabase]);

  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <Link href={'/'} className="flex items-center justify-center gap-2 rounded-md text-2xl font-medium">
          <Clock />
          <span className="bg-accent/50 rounded-sm border p-1">PRESENS</span>
        </Link>
        <LoginForm />
      </div>
    </main>
  );
}
