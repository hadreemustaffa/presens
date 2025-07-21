import { ActionResult } from '@/features/shared/model/interfaces';

export const handleDatabaseError = (error: unknown, defaultMessage: string): ActionResult => {
  console.error(error);
  return { error: defaultMessage };
};
