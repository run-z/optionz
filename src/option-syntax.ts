import { isArray } from '@proc7ts/primitives';
import { ZOptionInput } from './option-input.js';

/**
 * Supported command line syntax.
 *
 * The syntax is a function that converts raw command line arguments to {@link ZOptionInput option input} suitable
 * to be recognized by {@link ZOptionReader option readers}.
 *
 * A syntax should be {@link ZOptionsParser.Config.syntax registered} for options parser to respect it.
 *
 * @param args - An array of command line arguments to process.
 *
 * @returns A read-only array of option inputs. May be empty if the command line argument has another syntax.
 */
export type ZOptionSyntax = (
  this: void,
  args: readonly [string, ...string[]],
) => readonly ZOptionInput[];

/**
 * @internal
 */
const defaultZOptionSyntax = zOptionSyntaxBy([
  longZOptionSyntax,
  shortZOptionSyntax,
  anyZOptionSyntax,
]);

export const ZOptionSyntax = {
  /**
   * Default command line option syntax.
   *
   * Includes support for:
   *
   * - {@link longOptions long options syntax},
   * - {@link shortOptions short options syntax}, and
   * - {@link any any options syntax} as a fallback.
   */
  get default(): ZOptionSyntax {
    return defaultZOptionSyntax;
  },

  /**
   * Long command line option syntax.
   *
   * Supports the following option formats:
   *
   * - `--name=VALUE`. Corresponding option key is `--name`.
   * - `--name [VALUE [VALUE ...]]`. Corresponding option key is `--name=VALUE`, `--name=*`, or `--name`.
   *
   * Uses `--*=*` as a fallback option key for options in `--name=VALUE` format.
   * Uses `--*` as a generic fallback option key.
   *
   * Enabled {@link default by default}.
   */
  get longOptions(): ZOptionSyntax {
    return longZOptionSyntax;
  },

  /**
   * Short command line option syntax.
   *
   * Supports the following option formats:
   *
   * - `-name=VALUE`. Corresponding key is `-name=VALUE`, `-name=*`, or `-name`.
   * - `-name [VALUE [VALUE ...]]`. Corresponding option key is `-name`.
   * - `-n[m[o...]][VALUE]`. Corresponding option key is `-n*`.
   *
   * Uses `-*=*` as a fallback option key for options in `-name=VALUE` format.
   * Uses `-?` as a fallback option key for one-letter options.
   * Uses `-*` as a generic fallback option key.
   *
   * Enabled {@link default by default}.
   */
  get shortOptions(): ZOptionSyntax {
    return shortZOptionSyntax;
  },

  /**
   * Any command line option syntax.
   *
   * Supports `name [value1 [value2 ...]]` format. Uses `*` as a fallback option key.
   *
   * This is used as a fallback {@link default by default}.
   */
  get any(): ZOptionSyntax {
    return anyZOptionSyntax;
  },

  /**
   * Builds an option syntax supporting other syntaxes.
   *
   * @param syntax - Either a single syntax, or an array of syntaxes to support.
   *
   * @returns Either a single `syntax` passed in, or a syntax supporting all of them.
   */
  by(this: void, syntax: ZOptionSyntax | readonly ZOptionSyntax[]): ZOptionSyntax {
    return zOptionSyntaxBy(syntax);
  },
};

/**
 * @internal
 */
function zOptionSyntaxBy(syntax: ZOptionSyntax | readonly ZOptionSyntax[]): ZOptionSyntax {
  if (!isArray(syntax)) {
    return syntax;
  }

  return (args: readonly [string, ...string[]]): readonly ZOptionInput[] => {
    const tried: ZOptionInput[] = [];

    return syntax
      .flatMap(p => p(args))
      .filter(input => {
        // Prevent input duplicates
        if (tried.some(t => ZOptionInput.equal(t, input))) {
          return false;
        }

        tried.push(input);

        return true;
      });
  };
}

/**
 * @internal
 */
function longZOptionSyntax(args: readonly [string, ...string[]]): readonly ZOptionInput[] {
  let [name] = args;

  if (!name.startsWith('--')) {
    return [];
  }

  const eqIdx = name.indexOf('=', 3);

  if (eqIdx > 0) {
    // `--name=value` form

    const value = name.substr(eqIdx + 1);
    const values = [value];
    const tail = args.slice(1);

    name = name.substr(0, eqIdx);

    return [
      { key: `${name}=${value}`, name, values, tail },
      { key: `${name}=*`, name, values, tail },
      { name, values, tail },
      { key: '--*=*', name, values, tail },
      { key: '--*', name, values, tail },
    ];
  }

  // `--name [value [value ...]]` form
  const values = ZOptionInput.valuesOf(args, 1);
  const tail = args.slice(values.length + 1);

  return [
    { name, values, tail },
    { key: '--*', name, values, tail },
  ];
}

/**
 * @internal
 */
function shortZOptionSyntax(args: readonly [string, ...string[]]): readonly ZOptionInput[] {
  let [name] = args;

  if (name.length < 2 || !name.startsWith('-') || name.startsWith('--')) {
    return [];
  }

  const result: ZOptionInput[] = [];
  const eqIdx = name.indexOf('=', 2);

  if (eqIdx > 0) {
    // `-name=value` form

    const value = name.substr(eqIdx + 1);
    const values = [value];
    const tail = args.slice(1);

    name = name.substr(0, eqIdx);

    result.push({ key: `${name}=${value}`, name, values, tail });
    result.push({ key: `${name}=*`, name, values, tail });
    result.push({ name, values, tail });
    result.push({ key: '-*=*', name, values, tail });
    if (name.length === 2) {
      result.push({ key: '-?', name, values, tail });
    }
    result.push({ key: '-*', name, values, tail });

    return result;
  }

  const restArgs = args.slice(1);
  const values = ZOptionInput.valuesOf(restArgs);
  const tail = args.slice(values.length + 1);
  const restLetters = name.substr(2);

  result.push({ name, values, tail });

  if (restLetters) {
    const oneLetterName = name.substr(0, 2);
    const oneLetterTail = ['-' + restLetters, ...restArgs];

    result.push(
      { key: oneLetterName + '*', name: oneLetterName, values: [restLetters], tail: restArgs },
      { name: oneLetterName, tail: oneLetterTail },
      { key: '-?', name: oneLetterName, tail: oneLetterTail },
    );
  } else {
    // One-letter syntax
    result.push({ key: '-?', name, values, tail });
  }

  result.push({ key: '-*', name, values, tail });

  return result;
}

/**
 * @internal
 */
function anyZOptionSyntax(args: readonly [string, ...string[]]): readonly ZOptionInput[] {
  const [name] = args;
  const values = ZOptionInput.valuesOf(args, 1);
  const tail = args.slice(values.length + 1);

  return [
    { name, values, tail },
    { key: '*', name, values, tail },
  ];
}
