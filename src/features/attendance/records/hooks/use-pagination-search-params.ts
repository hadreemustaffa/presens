'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function usePaginationSearchParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentParams = Object.fromEntries(searchParams.entries());
  const { page = '1', pageSize = '10', sortBy = 'work_date', sortDirection = 'desc', ...filters } = currentParams;

  const buildSearchString = useCallback(
    (newParams: Record<string, string | number>) => {
      const merged = { ...currentParams, ...newParams };
      const cleaned = Object.entries(merged).filter(([_, v]) => v !== '' && v !== undefined && v !== null);

      const search = new URLSearchParams(cleaned as unknown as Record<string, string>);

      return `?${search.toString()}`;
    },
    [currentParams],
  );

  const updateParams = useCallback(
    (newParams: Record<string, string | number>) => {
      const searchString = buildSearchString(newParams);
      router.push(searchString);
    },
    [buildSearchString, router],
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
    buildSearchString,
  };
}
