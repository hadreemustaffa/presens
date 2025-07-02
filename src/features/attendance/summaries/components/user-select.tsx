'use client';

import { ArrowDown, LoaderCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMetadata } from '@/features/users/model/interfaces';

export default function UserSelect({ users, activeUser }: { users: UserMetadata[]; activeUser: UserMetadata }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const userParam = searchParams.get('employee_id');

  // Reset loading when the param changes
  useEffect(() => {
    setLoading(false);
  }, [userParam]);

  const handleChange = (employee_id: string) => {
    setLoading(true);
    const params = new URLSearchParams(searchParams);
    params.set('employee_id', employee_id);
    router.push(`?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={loading}>
          {userParam ? users.find((u) => u.employee_id === userParam)?.full_name : activeUser.full_name}
          {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <ArrowDown className="mr-2 h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-80">
        {users.map((u) => (
          <DropdownMenuItem key={u.employee_id} onClick={() => handleChange(u.employee_id)}>
            {u.full_name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
