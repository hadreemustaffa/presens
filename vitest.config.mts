import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['./src/**/(*.)?test.[jt]s?(x)'],
    coverage: {
      enabled: true,
      include: ['src/**/*.ts'],
      exclude: [
        '**/*.tsx}',
        // exclude test files
        'src/**/*.test.ts',
        // exclude types
        'src/lib/types/*.ts',
        'src/**/model/*.ts',
      ],
    },
  },
});
