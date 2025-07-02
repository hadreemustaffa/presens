import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AllTimeAttendanceSummary } from '@/lib/types/interfaces';

export default function PreferredHomeDaysCard({
  preferred_home_days,
}: Pick<AllTimeAttendanceSummary, 'preferred_home_days'>) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Preferred Home Days</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {preferred_home_days.map((day) => day).join(', ')}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
