// __tests__/repositories/users.test.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { UsersRepository } from '@/features/users/repositories/users';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    updateUser: vi.fn(),
  },
} as unknown as SupabaseClient;

describe('UsersRepository', () => {
  let repository: UsersRepository;

  beforeEach(() => {
    repository = new UsersRepository(mockSupabaseClient);
    vi.clearAllMocks();
  });

  describe('updateUser', () => {
    it('should call supabase.auth.updateUser with correct parameters', async () => {
      const updates = { email: 'test@example.com' };
      const expectedResult = { error: null };

      (mockSupabaseClient.auth.updateUser as Mock).mockResolvedValue(expectedResult);

      const result = await repository.updateUser(updates);

      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith(updates);
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should handle updates with nested data structure', async () => {
      const updates = {
        data: {
          full_name: 'John Doe',
          department: 'Engineering',
        },
      };
      const expectedResult = { error: null };

      (mockSupabaseClient.auth.updateUser as Mock).mockResolvedValue(expectedResult);

      const result = await repository.updateUser(updates);

      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith(updates);
      expect(result).toEqual(expectedResult);
    });

    it('should return error when supabase operation fails', async () => {
      const updates = { email: 'test@example.com' };
      const expectedError = { error: 'Database error' };

      (mockSupabaseClient.auth.updateUser as Mock).mockResolvedValue(expectedError);

      const result = await repository.updateUser(updates);

      expect(result).toEqual(expectedError);
    });

    it('should handle promise rejection', async () => {
      const updates = { email: 'test@example.com' };
      const error = new Error('Network error');

      (mockSupabaseClient.auth.updateUser as Mock).mockRejectedValue(error);

      await expect(repository.updateUser(updates)).rejects.toThrow('Network error');
    });
  });
});
