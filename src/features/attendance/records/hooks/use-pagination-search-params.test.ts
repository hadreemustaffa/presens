import { renderHook, act } from '@testing-library/react';
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from 'next/navigation';
import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';

import { usePaginationSearchParams } from '@/features/attendance/records/hooks/use-pagination-search-params';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

const mockPush = vi.fn();
const mockUseRouter = useRouter as MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as MockedFunction<typeof useSearchParams>;

describe('usePaginationSearchParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  it('should return default pagination params when no search params', () => {
    const mockSearchParams = new URLSearchParams({}) as unknown as ReadonlyURLSearchParams;

    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => usePaginationSearchParams());

    expect(result.current.paginationParams).toEqual({
      page: 1,
      pageSize: 10,
      sortBy: 'work_date',
      sortDirection: 'desc',
      filters: {},
    });
  });

  it('should parse existing search params correctly', () => {
    const mockSearchParams = new URLSearchParams({
      page: '2',
      pageSize: '20',
      sortBy: 'employee_name',
      sortDirection: 'asc',
      department: 'IT',
    }) as unknown as ReadonlyURLSearchParams;

    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => usePaginationSearchParams());

    expect(result.current.paginationParams).toEqual({
      page: 2,
      pageSize: 20,
      sortBy: 'employee_name',
      sortDirection: 'asc',
      filters: {
        department: 'IT',
      },
    });
  });

  it('should update URL when setPaginationParams is called', () => {
    const mockSearchParams = new URLSearchParams({
      page: '1',
      pageSize: '10',
    }) as unknown as ReadonlyURLSearchParams;

    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => usePaginationSearchParams());

    act(() => {
      result.current.setPaginationParams({
        page: 2,
        department: 'HR',
      });
    });

    expect(mockPush).toHaveBeenCalledWith('?page=2&pageSize=10&department=HR');
  });

  it('should filter out empty values when updating params', () => {
    const mockSearchParams = new URLSearchParams({
      page: '1',
      pageSize: '10',
      department: 'Marketing',
    }) as unknown as ReadonlyURLSearchParams;
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => usePaginationSearchParams());

    act(() => {
      result.current.setPaginationParams({
        department: '', // empty string should be filtered out
        work_mode: 'home',
      });
    });

    expect(mockPush).toHaveBeenCalledWith('?page=1&pageSize=10&work_mode=home');
  });

  it('should handle mixed parameter types correctly', () => {
    const mockSearchParams = new URLSearchParams() as unknown as ReadonlyURLSearchParams;
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => usePaginationSearchParams());

    act(() => {
      result.current.setPaginationParams({
        page: 3,
        pageSize: '20',
        sortBy: 'work_date',
      });
    });

    expect(mockPush).toHaveBeenCalledWith('?page=3&pageSize=20&sortBy=work_date');
  });

  it('should preserve existing params when updating', () => {
    const mockSearchParams = new URLSearchParams({
      page: '1',
      pageSize: '10',
      department: 'IT',
    }) as unknown as ReadonlyURLSearchParams;

    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => usePaginationSearchParams());

    act(() => {
      result.current.setPaginationParams({
        page: 2, // update page
        // department
      });
    });

    expect(mockPush).toHaveBeenCalledWith('?page=2&pageSize=10&department=IT');
  });

  it('should handle invalid numeric params gracefully', () => {
    const mockSearchParams = new URLSearchParams({
      page: 'invalid',
      pageSize: 'also-invalid',
    }) as unknown as ReadonlyURLSearchParams;
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => usePaginationSearchParams());

    expect(result.current.paginationParams).toEqual({
      page: NaN, // parseInt('invalid') returns NaN
      pageSize: NaN, // parseInt('also-invalid') returns NaN
      sortBy: 'work_date',
      sortDirection: 'desc',
      filters: {},
    });
  });
});
