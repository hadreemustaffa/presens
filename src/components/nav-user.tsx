'use client';

import { IconDotsVertical, IconLogout } from '@tabler/icons-react';
import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { logout } from '@/features/auth/actions/actions';
import { UserMetadata } from '@/features/users/model/interfaces';
import { ActionState } from '@/lib/middleware';

export function NavUser({ user }: { user: UserMetadata }) {
  const { isMobile } = useSidebar();
  const [state, action, pending] = useActionState<ActionState, FormData>(logout, { error: '', success: '' });

  useEffect(() => {
    if (state?.error) {
      toast.error('An error has occurred', {
        description: state.error,
        action: { label: 'Close', onClick: () => {} },
      });
    }
  }, [state]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarFallback className="rounded-lg">
                  {user?.full_name.charAt(0)}
                  {user?.full_name.charAt(1)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.full_name}</span>
                <span className="text-muted-foreground truncate text-xs">{user?.email}</span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {user?.full_name.charAt(0)}
                    {user?.full_name.charAt(1)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.full_name}</span>
                  <span className="text-muted-foreground truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-0">
              <form className="flex w-full items-center gap-2 pl-2">
                <IconLogout />
                <button formAction={action} className="w-full py-1.5 pr-2 text-left" disabled={pending}>
                  {pending ? 'Logging out...' : 'Log out'}
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
