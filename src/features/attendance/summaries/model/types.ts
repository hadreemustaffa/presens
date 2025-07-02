import { z } from 'zod';

import { DailyDataSchema } from '@/features/attendance/summaries/api/attendance-summaries.api';

export type DailyDataRecord = z.infer<typeof DailyDataSchema>;
