'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function usePaginationSearchParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentParams = Object.fromEntries(searchParams.entries());
  const { page = '1', pageSize = '10', sortBy = 'work_date', sortDirection = 'desc', ...filters } = currentParams;

  const updateParams = useCallback(
    (newParams: Record<string, string | number>) => {
      const merged = { ...currentParams, ...newParams };
      const cleaned = Object.entries(merged).filter(([_, v]) => v !== '' && v !== undefined && v !== null);

      const search = new URLSearchParams(cleaned as unknown as Record<string, string>);
      router.push(`?${search.toString()}`);
    },
    [currentParams, router],
  );

  return {
    paginationParams: {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      sortBy,
      sortDirection,
      filters,
    },
    setPaginationParams: updateParams,
  };
}
