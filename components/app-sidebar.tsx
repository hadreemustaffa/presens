'use client';

import { User } from '@supabase/supabase-js';
import { IconBook, IconChartBar, IconDashboard, IconSettings } from '@tabler/icons-react';
import { Clock } from 'lucide-react';
import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import { ThemeSwitcher } from '@/components/theme-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export const navLinks = {
  main: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Records',
      url: '/dashboard/records',
      icon: IconBook,
    },
    {
      title: 'Summaries',
      url: '/dashboard/summaries',
      icon: IconChartBar,
    },
  ],
  secondary: [
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: IconSettings,
    },
  ],
};

interface AppSideBarProps extends React.ComponentProps<typeof Sidebar> {
  user: User;
}

export function AppSidebar({ user, ...props }: AppSideBarProps) {
  const navUser = {
    name: user.user_metadata.full_name,
    email: user.user_metadata.email,
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between gap-2">
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <Clock className="!size-5" />
                <span className="text-base font-semibold">Presens</span>
              </a>
            </SidebarMenuButton>
            <ThemeSwitcher />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navLinks.main} />
        <NavSecondary items={navLinks.secondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
