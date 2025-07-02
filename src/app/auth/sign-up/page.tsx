import { SignUpForm } from '@/components/forms/sign-up-form';

export default function Page() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <SignUpForm />
      </div>
    </main>
  );
}
