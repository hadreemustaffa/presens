'use client';

import Image from 'next/image';

import { LoginForm } from '@/components/forms/login-form';

export default function Home() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <p className="flex items-center justify-center gap-2 rounded-md text-2xl font-medium">
          <Image src={'/icons/logo-32x32.png'} alt="" width={32} height={32} aria-hidden />
          <span className="font-semibold">PRESENS</span>
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
