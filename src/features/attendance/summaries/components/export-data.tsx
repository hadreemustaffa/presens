'use client';

import { Download } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportToCsv } from '@/features/attendance/summaries/actions/actions';
import { UserMetadata } from '@/features/users/model/interfaces';
import { ActionState } from '@/lib/middleware';

interface ExportActionState extends ActionState {
  data?: string;
  filename?: string;
}

export default function ExportData({ user }: { user: UserMetadata }) {
  const [state, action, pending] = useActionState<ExportActionState, FormData>(exportToCsv, { error: '', success: '' });

  const isAdmin = user?.user_role === 'admin';
  const searchParams = useSearchParams();
  const employee_id = searchParams.get('employee_id');

  const selectedUserId = isAdmin && employee_id ? employee_id : user?.employee_id;

  const downloadCsv = (csvData: string, filename: string) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Auto-download when CSV data is available
  if (state.success && state.data && state.filename) {
    downloadCsv(state.data, state.filename);
    // Reset state to prevent re-downloading
    state.data = undefined;
    state.filename = undefined;
  }

  useEffect(() => {
    if (state?.error) {
      toast.error('An error has occurred', {
        description: state.error,
        action: { label: 'Close', onClick: () => {} },
      });
    }
  }, [state]);

  useEffect(() => {
    if (state?.success) {
      toast.success('Success!', {
        description: state.success,
        action: { label: 'Close', onClick: () => {} },
      });
    }
  }, [state]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger title="Download summary data" asChild>
        <Button type="button" variant={'outline'} disabled={pending}>
          <Download />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <form>
          <input type="hidden" name="employee_id" value={selectedUserId} />
          <DropdownMenuItem asChild>
            <Button formAction={action} variant={'ghost'} className="w-full" disabled={pending}>
              {pending ? 'Generating CSV...' : 'Download as CSV'}
            </Button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
