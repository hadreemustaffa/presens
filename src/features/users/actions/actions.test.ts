import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';

import { Departments } from '@/features/shared/model/enums';
import { updateBasicInformation, updateEmail, updatePassword } from '@/features/users/actions/actions';
import { createUsersService, UsersService } from '@/features/users/services/users';

// Mock dependencies
vi.mock('@/features/users/services/users');
vi.mock('@/lib/middleware', () => ({
  validatedAction: vi.fn((schema, action) => action),
}));

const mockCreateUsersService = createUsersService as MockedFunction<typeof createUsersService>;

describe('Users Actions', () => {
  const mockService = {
    updateBasicInformation: vi.fn(),
    updateEmail: vi.fn(),
    updatePassword: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateUsersService.mockResolvedValue(mockService as unknown as UsersService);
  });

  describe('updateBasicInformation', () => {
    const mockData = {
      full_name: 'John Doe',
      department: Departments.Engineering,
    };

    it('should create service and call updateBasicInformation', async () => {
      const expectedResult = { success: 'Information updated' };
      mockService.updateBasicInformation.mockResolvedValue(expectedResult);

      const result = await updateBasicInformation(mockData, {} as FormData);

      expect(mockCreateUsersService).toHaveBeenCalledTimes(1);
      expect(mockService.updateBasicInformation).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockService.updateBasicInformation.mockRejectedValue(error);

      await expect(updateBasicInformation(mockData, {} as FormData)).rejects.toThrow('Service error');
    });

    it('should handle service creation failure', async () => {
      const error = new Error('Failed to create service');
      mockCreateUsersService.mockRejectedValue(error);

      await expect(updateBasicInformation(mockData, {} as FormData)).rejects.toThrow('Failed to create service');
    });
  });

  describe('updateEmail', () => {
    const mockData = { email: 'test@example.com' };

    it('should create service and call updateEmail with extracted email', async () => {
      const expectedResult = { success: 'Email updated' };
      mockService.updateEmail.mockResolvedValue(expectedResult);

      const result = await updateEmail(mockData, {} as FormData);

      expect(mockCreateUsersService).toHaveBeenCalledTimes(1);
      expect(mockService.updateEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockService.updateEmail.mockRejectedValue(error);

      await expect(updateEmail(mockData, {} as FormData)).rejects.toThrow('Service error');
    });

    it('should handle service creation failure', async () => {
      const error = new Error('Failed to create service');
      mockCreateUsersService.mockRejectedValue(error);

      await expect(updateEmail(mockData, {} as FormData)).rejects.toThrow('Failed to create service');
    });
  });

  describe('updatePassword', () => {
    const mockData = { new_password: 'newSecurePassword123' };

    it('should create service and call updatePassword with extracted password', async () => {
      const expectedResult = { success: 'Password updated' };
      mockService.updatePassword.mockResolvedValue(expectedResult);

      const result = await updatePassword(mockData, {} as FormData);

      expect(mockCreateUsersService).toHaveBeenCalledTimes(1);
      expect(mockService.updatePassword).toHaveBeenCalledWith('newSecurePassword123');
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockService.updatePassword.mockRejectedValue(error);

      await expect(updatePassword(mockData, {} as FormData)).rejects.toThrow('Service error');
    });

    it('should handle service creation failure', async () => {
      const error = new Error('Failed to create service');
      mockCreateUsersService.mockRejectedValue(error);

      await expect(updatePassword(mockData, {} as FormData)).rejects.toThrow('Failed to create service');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple concurrent action calls', async () => {
      const basicInfoData = { full_name: 'John', department: Departments.Engineering };
      const emailData = { email: 'john@example.com' };
      const passwordData = { new_password: 'newPassword123' };

      mockService.updateBasicInformation.mockResolvedValue({ success: 'Basic info updated' });
      mockService.updateEmail.mockResolvedValue({ success: 'Email updated' });
      mockService.updatePassword.mockResolvedValue({ success: 'Password updated' });

      const [basicResult, emailResult, passwordResult] = await Promise.all([
        updateBasicInformation(basicInfoData, {} as FormData),
        updateEmail(emailData, {} as FormData),
        updatePassword(passwordData, {} as FormData),
      ]);

      expect(mockCreateUsersService).toHaveBeenCalledTimes(3);
      expect(basicResult).toEqual({ success: 'Basic info updated' });
      expect(emailResult).toEqual({ success: 'Email updated' });
      expect(passwordResult).toEqual({ success: 'Password updated' });
    });
  });
});
