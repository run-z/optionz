import type { ZOptionsParser } from './options-parser.js';
import { SimpleZOptionsParser, simpleZOptionsParser } from './simple-options-parser.js';

/**
 * @internal
 */
const defaultZOptionsParser = /*#__PURE__*/ simpleZOptionsParser();

/**
 * Parses command line options.
 *
 * @param args - Array of command line arguments
 * @param opts - Parser options.
 *
 * @returns A promise resolved to a map of recognized option names to arrays of their values.
 */
export function parseZOptions(
  args: readonly string[],
  opts?: ZOptionsParser.Opts,
): Promise<SimpleZOptionsParser.Result> {
  return defaultZOptionsParser(args, opts);
}
