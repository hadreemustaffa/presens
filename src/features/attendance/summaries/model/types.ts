import { z } from 'zod';

import { DailyDataSchema } from '@/features/attendance/summaries/api/attendance-summaries.api';
import type { Exporter } from '@/features/attendance/summaries/model/interfaces';

export type DailyDataRecord = z.infer<typeof DailyDataSchema>;

export type SummarySearchParams = Promise<{ employee_id?: string; timeframe?: string }>;

export type ExportFormat = 'csv';
export type ExportersMap = Record<ExportFormat, Exporter>;
