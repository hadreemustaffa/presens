import { ArrowDown, LoaderCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Timeframe } from '@/lib/types/enums';

export default function TimeframeSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const timeParam = searchParams.get('timeframe') || 30;

  // Find the label for the current timeParam value
  const selectedLabel = Object.keys(Timeframe).find(
    (k) => Timeframe[k as keyof typeof Timeframe] === Number(timeParam),
  );

  useEffect(() => {
    setLoading(false);
  }, [timeParam]);

  const handleChange = (timeframe: Timeframe) => {
    setLoading(true);
    const params = new URLSearchParams(searchParams);
    params.set('timeframe', timeframe.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          Last {selectedLabel || '30 days'}
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowDown className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-80">
        {Object.values(Timeframe)
          .filter((t) => typeof t === 'number')
          .map((t) => {
            const label = Object.keys(Timeframe).find((k) => Timeframe[k as keyof typeof Timeframe] === t);
            // Disable if this is the currently selected timeframe
            const isSelected = Number(timeParam) === t;
            return (
              <DropdownMenuItem key={t} onClick={() => handleChange(t as Timeframe)} disabled={isSelected}>
                {label}
              </DropdownMenuItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
