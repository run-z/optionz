import type { ZOptionSyntax } from './option-syntax.js';
import type { ZOption } from './option.js';
import { ZOptionsParser$ } from './options-parser.impl.js';
import type { SupportedZOptions } from './supported-options.js';

/**
 * Command line options parser signature.
 *
 * @typeParam TOption  A type of option representation.
 * @typeParam TCtx  A type of option processing context required by parser.
 * @param context - Options processing context. This context is supposed to receive the processing results.
 * @param args - Array of command line arguments
 * @param opts - Parser options.
 *
 * @returns A promise resolved to processing context when parsing completes.
 */
export type ZOptionsParser<TOption extends ZOption, TCtx> = (
  this: void,
  context: TCtx,
  args: readonly string[],
  opts?: ZOptionsParser.Opts<TOption, TCtx>,
) => Promise<TCtx>;

export namespace ZOptionsParser {
  /**
   * Command line options parser configuration.
   *
   * @typeParam TOption  A type of option representation.
   * @typeParam TCtx  Option processing context required by parser.
   */
  export interface Config<TOption extends ZOption, TCtx> {
    /**
     * Supported command line options.
     */
    readonly options: SupportedZOptions<TOption, TCtx>;

    /**
     * Supported command line syntax.
     *
     * @default {@link ZOptionSyntax.default}
     */
    readonly syntax?: ZOptionSyntax | readonly ZOptionSyntax[] | undefined;

    /**
     * Builds command line option representation class.
     *
     * @param base - Base option representation class.
     *
     * @returns Command line option representation class constructor.
     */
    optionClass<TArgs extends any[]>(
      base: ZOption.BaseClass<TArgs>,
    ): ZOption.ImplClass<TOption, TCtx, TArgs>;
  }

  /**
   * Additional options for command line options parser.
   *
   * @typeParam TOption  A type of option representation.
   * @typeParam TCtx  A type of option processing context required by parser.
   */
  export interface Opts<TOption extends ZOption = ZOption, TCtx = unknown> {
    /**
     * An index of command line argument to start processing from.
     */
    readonly fromIndex?: number | undefined;

    /**
     * Additional options to support.
     */
    readonly options?: SupportedZOptions<TOption, TCtx> | undefined;
  }
}

/**
 * Builds custom command line options parser.
 *
 * @typeParam TOption  A type of option representation.
 * @typeParam TCtx  A type of option processing context required by parser.
 * @param config - Parser configuration.
 *
 * @returns New options parser.
 */
export function customZOptionsParser<TOption extends ZOption, TCtx>(
  config: ZOptionsParser.Config<TOption, TCtx>,
): ZOptionsParser<TOption, TCtx> {
  const parser = new ZOptionsParser$(config);

  return parser.parseOptions.bind(parser);
}
