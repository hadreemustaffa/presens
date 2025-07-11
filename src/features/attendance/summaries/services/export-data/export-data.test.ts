import { vi, it, expect, describe } from 'vitest';

import type { ExportersMap, ExportFormat } from '@/features/attendance/summaries/model/types';
import { ExportDataService } from '@/features/attendance/summaries/services/export-data/export-data';

describe('ExportDataService', () => {
  it('can be instantiated', () => {
    const service = new ExportDataService({ csv: { export: vi.fn() } });
    expect(service).toBeInstanceOf(ExportDataService);
  });

  it('can export data', async () => {
    const mockExporter = { export: vi.fn().mockResolvedValue('csv string') };
    const service = new ExportDataService({ csv: mockExporter });

    const data = { employee_id: 'TEST_ID' };
    const result = await service.exportAttendanceSummaries('csv', data);

    expect(mockExporter.export).toHaveBeenCalledWith(data);
    expect(result).toBe('csv string');
  });

  it('throws error for unsupported format', async () => {
    const service = new ExportDataService('unsupported' as unknown as ExportersMap);

    const data = { employee_id: 'TEST_ID' };

    await expect(service.exportAttendanceSummaries('unsupported' as unknown as ExportFormat, data)).rejects.toThrow(
      'Export format "unsupported" is not supported.',
    );
  });
});
