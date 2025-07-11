import Papa from 'papaparse';

import { CsvData } from '@/features/attendance/summaries/model/interfaces';

export class CsvExporter {
  async export(data: CsvData | null): Promise<string> {
    try {
      if (!data) {
        throw new Error('No data provided for CSV export');
      }

      return Papa.unparse([data], {
        header: true,
        delimiter: ';',
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`CSV export failed: ${error.message}`);
      } else {
        throw new Error('CSV export failed: An unknown error occurred');
      }
    }
  }
}
