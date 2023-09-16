import type { ZOption } from '../option';
import type { ZOptionMeta } from '../option-meta';
import type { ZOptionReader } from '../option-reader';
import type { ZHelpConfig } from './help-config';
import { ZHelpFormatter } from './help-formatter';

/**
 * Creates option reader able to build and print help info.
 *
 * @typeParam TOption  A type of help option.
 * @param config - Help configuration.
 *
 * @returns New option reader.
 */
export function helpZOptionReader<TOption extends ZOption>(
  config: ZHelpConfig<TOption> = {},
): ZOptionReader.Fn<TOption> {
  const brief = config.mode === 'brief';
  const compare = config.compare ? config.compare.bind(config) : compareZHelp;
  const display = displayZHelp(config);

  return option => {
    option.recognize();

    const options = buildZHelp(brief, option);

    options.sort(([key1, meta1], [key2, meta2]) => compare(key1, meta1, key2, meta2));

    return display(options, option);
  };
}

/**
 * @internal
 */
function buildZHelp(brief: boolean, option: ZOption): (readonly [string, ZOptionMeta.Combined])[] {
  const result: (readonly [string, ZOptionMeta.Combined])[] = [];

  for (const key of option.supportedOptions()) {
    const meta = option.optionMeta(key);

    if (!brief) {
      result.push([key, meta]);
    } else if (meta.help) {
      result.push([key, { ...meta, description: undefined }]);
    }
  }

  return result;
}

/**
 * @internal
 */
function displayZHelp<TOption extends ZOption>(
  config: ZHelpConfig<TOption>,
): (this: void, options: ZOptionMeta.List, option: TOption) => void | PromiseLike<unknown> {
  if (config.display) {
    return config.display.bind(config);
  }

  const formatter = new ZHelpFormatter();

  return async options => console.log(await formatter.help(options));
}

/**
 * @internal
 */
function compareZHelp(
  key1: string,
  meta1: ZOptionMeta.Combined,
  key2: string,
  meta2: ZOptionMeta.Combined,
): number {
  return compareZStrings(meta1.group, meta2.group) || compareZStrings(key1, key2);
}

/**
 * @internal
 */
function compareZStrings(str1: string | undefined, str2: string | undefined): number {
  if (!str1) {
    return str2 ? 1 : 0;
  }
  if (!str2) {
    return -1;
  }

  return str1 > str2 ? 1 : str1 < str2 ? -1 : 0;
}
