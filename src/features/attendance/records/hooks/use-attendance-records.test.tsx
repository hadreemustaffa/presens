import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';

import { useAttendanceRecords, usePrefetchNextPage } from '@/features/attendance/records/hooks/use-attendance-records';

// mock fetch
global.fetch = vi.fn();
const mockFetch = fetch as MockedFunction<typeof fetch>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sharedCache: Map<any, any>;
// test wrapper with SWR provider
const createWrapper = () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => sharedCache }}>{children}</SWRConfig>
  );
  Wrapper.displayName = 'SWRTestWrapper';
  return Wrapper;
};

describe('useAttendanceRecords', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    sharedCache = new Map();
  });

  it('should fetch attendance records successfully', async () => {
    const mockData = {
      data: [
        { employee_id: '123', work_date: '2024-01-01' },
        { employee_id: '123', work_date: '2024-01-02' },
      ],
      total: 2,
      page: 1,
      pageSize: 10,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { result } = renderHook(
      () =>
        useAttendanceRecords('123', {
          page: 1,
          pageSize: 10,
          sortBy: 'work_date',
          sortDirection: 'desc',
          filters: {},
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeUndefined();
  });

  it('should handle fetch errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch records'));

    const { result } = renderHook(
      () =>
        useAttendanceRecords('123', {
          page: 1,
          pageSize: 10,
          sortBy: 'work_date',
          sortDirection: 'desc',
          filters: {},
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.error.message).toBe('Failed to fetch records');
    expect(result.current.data).toBeUndefined();
  });

  it('should generate correct cache keys and use cache for identical calls', async () => {
    const { result: result1 } = renderHook(
      () =>
        useAttendanceRecords('123', {
          page: 1,
          pageSize: 10,
          sortBy: 'work_date',
          sortDirection: 'desc',
          filters: { department: 'IT' },
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result1.current).toBeDefined();
    });

    // second call should use cache
    const { result: result2 } = renderHook(
      () =>
        useAttendanceRecords('123', {
          page: 1,
          pageSize: 10,
          sortBy: 'work_date',
          sortDirection: 'desc',
          filters: { department: 'IT' },
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result2.current).toBeDefined();
    });

    // should only call fetch once because second call uses cache
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should filter out empty filter values', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], total: 0 }),
    } as Response);

    renderHook(
      () =>
        useAttendanceRecords('123', {
          page: 1,
          pageSize: 10,
          sortBy: 'work_date',
          sortDirection: 'desc',
          filters: { department: 'IT', work_mode: '' },
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/attendance-records'));
    });

    // check that URL doesn't contain empty filter values
    const callUrl = mockFetch.mock.calls[0][0] as string;
    expect(callUrl).toContain('filter_department=IT');
    expect(callUrl).not.toContain('filter_work_mode=');
  });
});

describe('usePrefetchNextPage', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    sharedCache = new Map();
  });

  it('should prefetch next page attendance records successfully', async () => {
    const mockNextPageData = {
      data: [
        { employee_id: '123', work_date: '2024-01-11' },
        { employee_id: '123', work_date: '2024-01-12' },
      ],
      page: 2,
      pageSize: 10,
      total: 12,
      totalPages: 2,
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockNextPageData,
    } as Response);

    renderHook(
      () =>
        usePrefetchNextPage('123', {
          page: 1,
          pageSize: 10,
          sortBy: 'work_date',
          sortDirection: 'desc',
          filters: { department: 'IT' },
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // verify the URL contains the expected parameters for the next page
    const callUrl = mockFetch.mock.calls[0][0] as string;
    expect(callUrl).toContain('page=2'); // next page
    expect(callUrl).toContain('pageSize=10');
    expect(callUrl).toContain('sortBy=work_date');
    expect(callUrl).toContain('sortDirection=desc');
    expect(callUrl).toContain('filter_department=IT');
    expect(callUrl).toContain('/api/attendance-records');
  });

  it('should cache prefetched data for subsequent use', async () => {
    const mockNextPageData = {
      data: [
        { employee_id: '123', work_date: '2024-01-11' },
        { employee_id: '123', work_date: '2024-01-12' },
      ],
      page: 2,
      pageSize: 10,
      total: 12,
      totalPages: 2,
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockNextPageData,
    } as Response);

    // prefetch the next page
    const { unmount: unmountPrefetch } = renderHook(
      () =>
        usePrefetchNextPage('123', {
          page: 1,
          pageSize: 10,
          sortBy: 'work_date',
          sortDirection: 'desc',
          filters: { department: 'IT' },
        }),
      { wrapper: createWrapper() },
    );

    // wait for prefetch to complete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // clean up prefetch hook
    unmountPrefetch();

    // now use the same parameters to fetch page 2
    const { result: nextPageResult } = renderHook(
      () =>
        useAttendanceRecords('123', {
          page: 2,
          pageSize: 10,
          sortBy: 'work_date',
          sortDirection: 'desc',
          filters: { department: 'IT' },
        }),
      { wrapper: createWrapper() },
    );

    // data should be available from cache
    await waitFor(() => {
      expect(nextPageResult.current.data).toEqual(mockNextPageData);
    });

    // should only have 1 fetch call (from prefetch)
    // If this fails, it means caching isn't working as expected
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle prefetch with no filters', async () => {
    const mockData = {
      data: [{ employee_id: '123', work_date: '2024-01-11' }],
      page: 2,
      pageSize: 10,
      total: 5,
      totalPages: 1,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    renderHook(
      () =>
        usePrefetchNextPage('123', {
          page: 1,
          pageSize: 10,
          sortBy: 'work_date',
          sortDirection: 'desc',
          filters: {},
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    const callUrl = mockFetch.mock.calls[0][0] as string;
    expect(callUrl).toContain('page=2');
    expect(callUrl).not.toContain('filter_');
  });

  it('should handle prefetch failure gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(
      () =>
        usePrefetchNextPage('123', {
          page: 1,
          pageSize: 10,
          sortBy: 'work_date',
          sortDirection: 'desc',
          filters: { department: 'IT' },
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    expect(result.current).toBeUndefined();
  });
});
