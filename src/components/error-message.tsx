import { AlertCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

export function ErrorMessage({ className, children }: React.ComponentPropsWithoutRef<'p'>) {
  return (
    <p className={cn('flex w-full items-center gap-2 rounded-sm py-1 text-xs text-red-500/80', className)} role="alert">
      <AlertCircle size={16} aria-hidden="true" />
      {children}
    </p>
  );
}
