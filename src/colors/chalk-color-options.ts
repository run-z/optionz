import type { ColorSupport, ColorSupportLevel } from 'chalk';
import chalk from 'chalk';
import { ZOptionError } from '../option-error.js';
import type { ZOption } from '../option.js';
import type { SupportedZOptions } from '../supported-options.js';
import type { ChalkZColorConfig } from './chalk-color-config.js';
import { clz } from './colors.js';

/**
 * @internal
 */
const chalkZColorLevels: {
  readonly [key: string]: ColorSupportLevel | undefined;
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
 * @internal
 */
const chalkZColorModes: {
  readonly [level in ColorSupportLevel]: ColorSupport;
} = {
  0: {
    level: 0,
    hasBasic: false,
    has256: false,
    has16m: false,
  },
  1: {
    level: 1,
    hasBasic: true,
    has256: false,
    has16m: false,
  },
  2: {
    level: 2,
    hasBasic: true,
    has256: true,
    has16m: false,
  },
  3: {
    level: 3,
    hasBasic: true,
    has256: true,
    has16m: true,
  },
};

/**
 * Accepts `--color`, `--no-color`, and `--no-colors` options.
 *
 * Then [chalk] would be able to interpret them .
 *
 * [chalk]: https://www.npmjs.com/package/chalk
 *
 * @param config - Chalk color support configuration.
 *
 * @returns Supported set of color options.
 */
export function chalkZColorOptions<TOption extends ZOption>(
  config: ChalkZColorConfig<TOption> = {},
): SupportedZOptions<TOption> {
  const forceColors = config.forceColors ? config.forceColors.bind(config) : forceChalkZColors;
  const readColorOff = (option: TOption): void | PromiseLike<unknown> => {
    option.recognize();

    return forceColors(chalkZColorModes[0], option);
  };

  return {
    '--color': {
      read(option) {
        option.recognize();

        return forceColors(chalkZColorModes[1], option);
      },
      meta: {
        help: 'Force color terminal support',
        group: 'tty:colors',
        get description() {
          return `
${clz.param('MODE')} can be one of:

${clz.bullet()} ${clz.usage('16m')}, ${clz.usage('full')}, or ${clz.usage(
            'truecolor',
          )} - enable TrueColor support;
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
          return forceColors(chalkZColorModes[level], option);
        }

        throw new ZOptionError(
          option.optionLocation({ index: option.argIndex + 1 }),
          `Unrecognized terminal color mode: "${value}"`,
        );
      },
      meta: {
        aliasOf: '--color',
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
function forceChalkZColors(mode: ColorSupport): void {
  chalk.level = mode.level;
}
