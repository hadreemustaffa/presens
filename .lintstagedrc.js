import path from 'path';

const buildEslintFixCommand = (filenames) =>
  `next lint --fix --file ${filenames.map((f) => path.relative(process.cwd(), f)).join(' --file ')}`;

const buildPrettierCommand = (filenames) =>
  `prettier --write ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`;

const lintStagedConfig = {
  '*.{js,jsx,ts,tsx}': [buildEslintFixCommand, buildPrettierCommand],
  '*.{md, json}': [buildPrettierCommand],
};

export default lintStagedConfig;
