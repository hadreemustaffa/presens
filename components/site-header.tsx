'use client';

import dayjs from 'dayjs';
import { usePathname } from 'next/navigation';

import { navLinks } from '@/components/app-sidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function SiteHeader() {
  const today = dayjs().format('DD MMMM YYYY');
  const path = usePathname();

  const navLinksData = [...navLinks.main, ...navLinks.secondary].flatMap((link) => {
    return {
      title: link.title,
      url: link.url,
    };
  });

  const currentPath = navLinksData.find((link) => link.url === path);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-1 px-4 text-sm lg:gap-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger size={'icon'} />
          <p>{currentPath?.title}</p>
        </div>
        <p>{today}</p>
      </div>
    </header>
  );
}
