// __tests__/services/users.test.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, Mocked, MockedClass, MockedFunction, vi } from 'vitest';

import { handleDatabaseError } from '@/features/shared/lib/utils';
import { Departments } from '@/features/shared/model/enums';
import { UsersRepository } from '@/features/users/repositories/users';
import { UsersService, createUsersService } from '@/features/users/services/users';
import { SETTINGS_PATH } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';

vi.mock('next/cache');
vi.mock('@/features/shared/lib/utils');
vi.mock('@/lib/supabase/server');
vi.mock('@/features/users/repositories/users');

const mockRevalidatePath = revalidatePath as MockedFunction<typeof revalidatePath>;
const mockHandleDatabaseError = handleDatabaseError as MockedFunction<typeof handleDatabaseError>;
const mockCreateClient = createClient as MockedFunction<typeof createClient>;
const MockUsersRepository = UsersRepository as MockedClass<typeof UsersRepository>;

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: Mocked<UsersRepository>;

  beforeEach(() => {
    mockRepository = {
      updateUser: vi.fn(),
    } as unknown as Mocked<UsersRepository>;

    service = new UsersService(mockRepository);
    vi.clearAllMocks();
  });

  describe('updateBasicInformation', () => {
    const mockData = {
      full_name: 'John Doe',
      department: Departments.Engineering,
    };

    it('should update basic information successfully', async () => {
      mockRepository.updateUser.mockResolvedValue({ error: null });

      const result = await service.updateBasicInformation(mockData);

      expect(mockRepository.updateUser).toHaveBeenCalledWith({
        data: {
          full_name: 'John Doe',
          department: Departments.Engineering,
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith(SETTINGS_PATH);
      expect(result).toEqual({ success: 'Your information have been updated.' });
    });

    it('should handle database error', async () => {
      const error = new Error('Database error');
      const errorResult = { error: 'Failed to update your information.' };

      mockRepository.updateUser.mockResolvedValue({ error });
      mockHandleDatabaseError.mockReturnValue(errorResult);

      const result = await service.updateBasicInformation(mockData);

      expect(mockHandleDatabaseError).toHaveBeenCalledWith(error, 'Failed to update your information.');
      expect(mockRevalidatePath).not.toHaveBeenCalled();
      expect(result).toEqual(errorResult);
    });

    it('should not revalidate path when error occurs', async () => {
      const error = new Error('Database error');
      mockRepository.updateUser.mockResolvedValue({ error });
      mockHandleDatabaseError.mockReturnValue({ error: 'Some error' });

      await service.updateBasicInformation(mockData);

      expect(mockRevalidatePath).not.toHaveBeenCalled();
    });
  });

  describe('updateEmail', () => {
    const testEmail = 'test@example.com';

    it('should update email successfully', async () => {
      mockRepository.updateUser.mockResolvedValue({ error: null });

      const result = await service.updateEmail(testEmail);

      expect(mockRepository.updateUser).toHaveBeenCalledWith({ email: testEmail });
      expect(result).toEqual({ success: 'A confirmation email has been sent.' });
    });

    it('should handle database error', async () => {
      const error = new Error('Database error');
      const errorResult = { error: 'Failed to send confirmation email.' };

      mockRepository.updateUser.mockResolvedValue({ error });
      mockHandleDatabaseError.mockReturnValue(errorResult);

      const result = await service.updateEmail(testEmail);

      expect(mockHandleDatabaseError).toHaveBeenCalledWith(error, 'Failed to send confirmation email.');
      expect(result).toEqual(errorResult);
    });

    it('should handle empty email string', async () => {
      mockRepository.updateUser.mockResolvedValue({ error: null });

      const result = await service.updateEmail('');

      expect(mockRepository.updateUser).toHaveBeenCalledWith({ email: '' });
      expect(result).toEqual({ success: 'A confirmation email has been sent.' });
    });
  });

  describe('updatePassword', () => {
    const newPassword = 'newSecurePassword123';

    it('should update password successfully', async () => {
      mockRepository.updateUser.mockResolvedValue({ error: null });

      const result = await service.updatePassword(newPassword);

      expect(mockRepository.updateUser).toHaveBeenCalledWith({ password: newPassword });
      expect(mockRevalidatePath).toHaveBeenCalledWith(SETTINGS_PATH);
      expect(result).toEqual({ success: 'Your password have been updated.' });
    });

    it('should handle database error', async () => {
      const error = new Error('Database error');
      const errorResult = { error: 'Failed to update your password.' };

      mockRepository.updateUser.mockResolvedValue({ error });
      mockHandleDatabaseError.mockReturnValue(errorResult);

      const result = await service.updatePassword(newPassword);

      expect(mockHandleDatabaseError).toHaveBeenCalledWith(error, 'Failed to update your password.');
      expect(mockRevalidatePath).not.toHaveBeenCalled();
      expect(result).toEqual(errorResult);
    });

    it('should not revalidate path when error occurs', async () => {
      const error = new Error('Database error');
      mockRepository.updateUser.mockResolvedValue({ error });
      mockHandleDatabaseError.mockReturnValue({ error: 'Some error' });

      await service.updatePassword(newPassword);

      expect(mockRevalidatePath).not.toHaveBeenCalled();
    });
  });
});

describe('createUsersService', () => {
  const mockSupabaseClient = {} as Mocked<SupabaseClient>;
  const mockRepository = {} as Mocked<UsersRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockResolvedValue(mockSupabaseClient);
    MockUsersRepository.mockImplementation(() => mockRepository);
  });

  it('should create UsersService instance with proper dependencies', async () => {
    const service = await createUsersService();

    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(MockUsersRepository).toHaveBeenCalledWith(mockSupabaseClient);
    expect(service).toBeInstanceOf(UsersService);
  });
});
