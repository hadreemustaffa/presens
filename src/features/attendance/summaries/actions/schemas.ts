import { z } from 'zod';

export const exportToCsvSchema = z.object({
  employee_id: z.string(),
});
