import type { CsvData } from '@/features/attendance/summaries/model/interfaces';
import type { ExportersMap, ExportFormat } from '@/features/attendance/summaries/model/types';
import { CsvExporter } from '@/features/attendance/summaries/services/export-data/exporters/csv-exporter';

export class ExportDataService {
  constructor(private exporters: ExportersMap) {}

  async exportAttendanceSummaries(format: ExportFormat, data: CsvData) {
    const exporter = this.exporters[format];
    if (!exporter) {
      throw new Error(`Export format "${format}" is not supported.`);
    }
    return await exporter.export(data);
  }
}

export const createExportDataService = (): ExportDataService => {
  const csvExporter = new CsvExporter();
  return new ExportDataService({
    csv: csvExporter,
  });
};
