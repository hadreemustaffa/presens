import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getActiveUser } from '@/features/users/api/users.api';
import { UserMetadata } from '@/features/users/model/interfaces';

export const metadata = {
  title: {
    default: 'Dashboard | Presens',
    template: '%s | Presens',
  },
  description: 'Track your attendance, work modes, and analytics.',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getActiveUser();

  const userMetadata = user?.user_metadata as UserMetadata;

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" user={userMetadata} />
      <div className="flex w-full flex-1 flex-col">
        <SiteHeader />
        <div className="@container/main flex h-full flex-col gap-4 py-4 md:gap-6 md:py-6">{children}</div>
      </div>
    </SidebarProvider>
  );
}
