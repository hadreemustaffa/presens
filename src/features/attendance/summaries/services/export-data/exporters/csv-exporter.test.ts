import { describe, expect, it } from 'vitest';

import { CsvExporter } from '@/features/attendance/summaries/services/export-data/exporters/csv-exporter';

describe('CsvExporter', () => {
  it('can be instantiated', () => {
    const exporter = new CsvExporter();
    expect(exporter).toBeInstanceOf(CsvExporter);
  });

  it('exports CSV correctly', async () => {
    const exporter = new CsvExporter();
    const data = { field1: 'A', field2: 'B' };

    const result = await exporter.export(data);

    expect(result).toContain('field1;field2');
    expect(result).toContain('A;B');
  });

  it('throws error if data is not provided', async () => {
    const exporter = new CsvExporter();
    await expect(exporter.export(null)).rejects.toThrow('No data provided for CSV export');
  });
});
