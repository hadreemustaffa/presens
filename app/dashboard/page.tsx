import { SectionCards } from '@/components/section-cards';

export default async function DashboardPage() {
  return (
    <div className="flex w-full flex-col gap-12 p-4">
      <SectionCards />
    </div>
  );
}
