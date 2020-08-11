/**
 * @packageDocumentation
 * @module @run-z/optionz/colors
 */
import type { ZOption } from '../option';
import { ZOptionError } from '../option-error';
import type { SupportedZOptions } from '../supported-options';
import type { ChalkZColorConfig } from './chalk-color-config';
import { clz } from './colors';

/**
 * @internal
 */
const chalkZColorLevels: {
  readonly [key: string]: 0 | 1 | 2 | 3 | undefined;
} = {
  '16m': 3,
  full: 3,
  truecolor: 3,
  256: 2,
  true: 1,
  always: 1,
  false: 0,
  never: 0,
};


/**
 * Accepts `--color`, `--no-color`, and `--no-colors` options.
 *
 * Then [chalk] would be able to interpret them .
 *
 * [chalk]: https://www.npmjs.com/package/chalk
 *
 * @param config  Chalk color support configuration.
 *
 * @returns Supported set of color options.
 */
export function chalkZColorOptions<TOption extends ZOption>(
    config: ChalkZColorConfig<TOption> = {},
): SupportedZOptions<TOption> {

  const forceColors = config.forceColors ? config.forceColors.bind(config) : forceChalkZColors;
  const readColorOff = (option: TOption): void | PromiseLike<unknown> => {
    option.recognize();
    return forceColors(0, option);
  };

  return {
    '--color': {
      read(option) {
        option.recognize();
        return forceColors(1, option);
      },
      meta: {
        help: 'Force color terminal support',
        group: 'tty:colors',
        get description() {
          return `
${clz.param('MODE')} can be one of:

${clz.bullet()} ${clz.usage('16m')}, ${clz.usage('full')}, or ${clz.usage('truecolor')} - enable TrueColor support;
${clz.bullet()} ${clz.usage('256')} - enable 256 colors support;
${clz.bullet()} ${clz.usage('true')}, ${clz.usage('always')}, or none - enable basic colors support;
${clz.bullet()} ${clz.usage('false')}, ${clz.usage('never')} - disable colors.
`;
        },
      },
    },
    '--color=*': {
      read(option) {

        const [value] = option.values();
        const level = chalkZColorLevels[value];

        if (level != null) {
          return forceColors(level, option);
        }

        throw new ZOptionError(
            option.optionLocation({ index: option.argIndex + 1 }),
            `Unrecognized terminal color mode: "${value}"`,
        );
      },
      meta: {
        get usage() {
          return `--color=${clz.param('MODE')}`;
        },
      },
    },

    '--no-color': {
      read: readColorOff,
      meta: {
        group: 'tty:colors',
        help: 'Forcibly disable color terminal support',
      },
    },
    '--no-colors': {
      read: readColorOff,
      meta: {
        aliasOf: '--no-color',
      },
    },
  };
}

/**
 * @internal
 */
function forceChalkZColors(level: 0 | 1 | 2 | 3): void {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('chalk').supportsColor.level = level;
}
