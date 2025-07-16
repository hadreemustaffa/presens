import useSWR from 'swr';

import {
  AttendanceRecord,
  AttendanceRecordWithUserDetails,
  PaginatedResponse,
  PaginationParams,
} from '@/features/attendance/records/model/interfaces';

async function fetchPaginatedRecords(
  url: string,
  params: PaginationParams & { employee_id?: string },
): Promise<PaginatedResponse<AttendanceRecord | AttendanceRecordWithUserDetails>> {
  const queryParams = new URLSearchParams();

  queryParams.append('page', params.page.toString());
  queryParams.append('pageSize', params.pageSize.toString());

  if (params.sortBy) {
    queryParams.append('sortBy', params.sortBy);
  }

  if (params.sortDirection) {
    queryParams.append('sortDirection', params.sortDirection);
  }

  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        queryParams.append(`filter_${key}`, value);
      }
    });
  }

  const response = await fetch(`${url}?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch records');
  }

  return response.json();
}

export function useAttendanceRecords(employee_id: string, paginationParams: PaginationParams) {
  // Ensure consistent filter ordering
  const sortedFilters = paginationParams.filters
    ? Object.keys(paginationParams.filters)
        .sort()
        .reduce(
          (acc, key) => {
            const value = paginationParams.filters![key];
            if (value !== '' && value !== null && value !== undefined) {
              acc[key] = value;
            }
            return acc;
          },
          {} as Record<string, string>,
        )
    : {};

  const cacheKey = [
    'attendance-records',
    employee_id,
    paginationParams.page,
    paginationParams.pageSize,
    paginationParams.sortBy,
    paginationParams.sortDirection,
    JSON.stringify(sortedFilters),
  ];

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    () =>
      fetchPaginatedRecords('/api/attendance-records', {
        ...paginationParams,
        filters: sortedFilters,
        employee_id,
      }),
    {
      dedupingInterval: 30 * 1000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 5 * 60 * 1000,
      keepPreviousData: true,
    },
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

export function usePrefetchNextPage(employee_id: string, currentParams: PaginationParams) {
  const nextPageParams = {
    ...currentParams,
    page: currentParams.page + 1,
  };

  // ensure consistent filter orders
  const sortedFilters = currentParams.filters
    ? Object.keys(currentParams.filters)
        .sort()
        .reduce(
          (acc, key) => {
            const value = currentParams.filters![key];
            if (value !== '' && value !== null && value !== undefined) {
              acc[key] = value;
            }
            return acc;
          },
          {} as Record<string, string>,
        )
    : {};

  const nextPageCacheKey = [
    'attendance-records',
    employee_id,
    nextPageParams.page,
    nextPageParams.pageSize,
    nextPageParams.sortBy,
    nextPageParams.sortDirection,
    JSON.stringify(sortedFilters),
  ];

  // prefetch next page data
  useSWR(
    nextPageCacheKey,
    () =>
      fetchPaginatedRecords('/api/attendance-records', {
        ...nextPageParams,
        filters: sortedFilters,
        employee_id,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    },
  );
}
