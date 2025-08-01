import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarProvider } from '@/components/ui/sidebar';

export const metadata = {
  title: {
    default: 'Dashboard | Presens',
    template: '%s | Presens',
  },
  description: 'Track your attendance, work modes, and analytics.',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" />
      <div className="flex w-full flex-1 flex-col">
        <SiteHeader />
        <div className="@container/main flex h-full flex-col gap-4 py-4 md:gap-6 md:py-6">{children}</div>
      </div>
    </SidebarProvider>
  );
}
