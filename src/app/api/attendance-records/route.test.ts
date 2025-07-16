// __tests__/api/attendance-records.test.ts
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';

import { getActiveUser } from '@/api';
import { GET } from '@/app/api/attendance-records/route';
import {
  getAllAttendanceRecords,
  getAllEmployeesAttendanceRecords,
} from '@/features/attendance/records/api/attendance-records.api';

// Mock dependencies
vi.mock('@/api');
vi.mock('@/features/attendance/records/api/attendance-records.api');

const mockGetActiveUser = getActiveUser as MockedFunction<typeof getActiveUser>;
const mockGetAllAttendanceRecords = getAllAttendanceRecords as MockedFunction<typeof getAllAttendanceRecords>;
const mockGetAllEmployeesAttendanceRecords = getAllEmployeesAttendanceRecords as MockedFunction<
  typeof getAllEmployeesAttendanceRecords
>;

describe('/api/attendance-records', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch user records for non-admin users', async () => {
    const mockUser = {
      id: 'user-1',
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z',
      user_metadata: { employee_id: 'emp123' },
    };

    const mockData = {
      data: [
        {
          employee_id: 'emp123',
          work_date: '2024-01-01',
          id: 0,
          work_mode: 'office',
          clock_in: '2024-01-01T07:30:00.000Z',
          clock_out: null,
          lunch_out: null,
          lunch_in: null,
          remarks: null,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    };

    mockGetActiveUser.mockResolvedValue({ user: mockUser, isAdmin: false });
    mockGetAllAttendanceRecords.mockResolvedValue(mockData);

    const url = 'http://localhost/api/attendance-records?page=1&pageSize=10&sortBy=work_date&sortDirection=desc';
    const request = new NextRequest(url);
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockGetAllAttendanceRecords).toHaveBeenCalledWith(
      { employee_id: 'emp123' },
      {
        page: 1,
        pageSize: 10,
        sortBy: 'work_date',
        sortDirection: 'desc',
        filters: {},
      },
    );
  });

  it('should fetch all employee records for admin users', async () => {
    const mockUser = {
      id: 'user-1',
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z',
      user_metadata: { employee_id: 'emp123' },
    };

    mockGetActiveUser.mockResolvedValue({ user: mockUser, isAdmin: true });
    mockGetAllEmployeesAttendanceRecords.mockResolvedValue({
      data: [
        {
          full_name: 'John',
          department: 'admin',
          employee_id: 'emp123',
          work_date: '2024-01-01',
          id: 1,
          work_mode: 'office',
          clock_in: '2024-01-01T00:00:00.000Z',
          clock_out: null,
          lunch_out: null,
          lunch_in: null,
          remarks: null,
        },
        {
          full_name: 'oliver',
          department: 'marketing',
          employee_id: 'emp456',
          work_date: '2024-01-01',
          id: 2,
          work_mode: 'office',
          clock_in: '2024-01-01T00:00:00.000Z',
          clock_out: null,
          lunch_out: null,
          lunch_in: null,
          remarks: null,
        },
      ],
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    const url = 'http://localhost/api/attendance-records?page=1&pageSize=10&sortBy=work_date&sortDirection=desc';
    const request = new NextRequest(url);
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockGetAllEmployeesAttendanceRecords).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      sortBy: 'work_date',
      sortDirection: 'desc',
      filters: {},
    });
  });

  it('should parse filter parameters correctly', async () => {
    const mockUser = {
      id: 'user-1',
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z',
      user_metadata: { employee_id: '123' },
    };

    mockGetActiveUser.mockResolvedValue({ user: mockUser, isAdmin: false });
    mockGetAllAttendanceRecords.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    const url = 'http://localhost/api/attendance-records?page=1&pageSize=10&filter_department=IT';
    const request = new NextRequest(url);
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockGetAllAttendanceRecords).toHaveBeenCalledWith(
      { employee_id: '123' },
      {
        page: 1,
        pageSize: 10,
        sortBy: undefined,
        sortDirection: undefined,
        filters: {
          department: 'IT',
        },
      },
    );
  });

  it('should handle API errors gracefully', async () => {
    const mockUser = {
      id: 'user-1',
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z',
      user_metadata: { employee_id: '123' },
    };

    mockGetActiveUser.mockResolvedValue({ user: mockUser, isAdmin: false });
    mockGetAllAttendanceRecords.mockRejectedValue(new Error('Database error'));

    const url = 'http://localhost/api/attendance-records?page=1&pageSize=10';
    const request = new NextRequest(url);
    const response = await GET(request);

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json).toEqual({ error: 'Internal server error' });
  });

  it('should parse numeric parameters correctly', async () => {
    const mockUser = {
      id: 'user-1',
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z',
      user_metadata: { employee_id: '123' },
    };

    mockGetActiveUser.mockResolvedValue({ user: mockUser, isAdmin: false });
    mockGetAllAttendanceRecords.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    const url = 'http://localhost/api/attendance-records?page=1&pageSize=10';
    const request = new NextRequest(url);
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockGetAllAttendanceRecords).toHaveBeenCalledWith(
      { employee_id: '123' },
      expect.objectContaining({
        page: 1,
        pageSize: 10,
      }),
    );
  });
});
