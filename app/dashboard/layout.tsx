import { getActiveUser } from '@/api/dashboard';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarProvider } from '@/components/ui/sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getActiveUser();

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar user={user} variant="sidebar" />
      <div className="flex w-full flex-1 flex-col">
        <SiteHeader />
        <div className="@container/main flex h-full flex-col gap-4 py-4 md:gap-6 md:py-6">{children}</div>
      </div>
    </SidebarProvider>
  );
}
