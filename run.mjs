import { counts, list, option, selectors, stdout, value } from '@cairul/plugin-kit/runner';

function summarize(output) {
  const found = [...output.matchAll(/(\d+) runs?, \d+ assertions?, (\d+) failures?, (\d+) errors?, (\d+) skips?/g)].at(
    -1
  );
  if (!found) throw new Error('Minitest returned no test summary.');
  const [, total, failures, errors, skipped] = found.map(Number);
  return counts(Math.max(0, total - failures - errors - skipped), failures + errors, skipped);
}

export default {
  command: ['ruby'],
  select: selectors({ files: list, namePattern: value }),
  build({ files, namePattern }, _temp, { command }) {
    if (!files && !command)
      throw new Error('Set plugin options.command to your Minitest suite entry point, or select test files.');
    const args = command
      ? [...(files ?? []), ...option('--name', namePattern)]
      : ['-Itest', ...files.flatMap((file) => ['-r', './' + file]), '-e', '', '--', ...option('--name', namePattern)];
    return { args, capture: 'combined', read: stdout(summarize) };
  },
};
