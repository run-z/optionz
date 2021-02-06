import type { ZOption } from './option';
import type { ZOptionSyntax } from './option-syntax';
import { ZOptionsParser$ } from './options-parser.impl';
import type { SupportedZOptions } from './supported-options';

/**
 * Command line options parser signature.
 *
 * @typeparam TOption  A type of option representation.
 * @typeparam TCtx  A type of option processing context required by parser.
 */
export type ZOptionsParser<TOption extends ZOption, TCtx> =
/**
 * @param context - Options processing context. This context is supposed to receive the processing results.
 * @param args - Array of command line arguments
 * @param opts - Parser options.
 *
 * @returns A promise resolved to processing context when parsing completes.
 */
    (
        this: void,
        context: TCtx,
        args: readonly string[],
        opts?: ZOptionsParser.Opts<TOption, TCtx>,
    ) => Promise<TCtx>;

export namespace ZOptionsParser {

  /**
   * Command line options parser configuration.
   *
   * @typeparam TOption  A type of option representation.
   * @typeparam TCtx  Option processing context required by parser.
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
    readonly syntax?: ZOptionSyntax | readonly ZOptionSyntax[];

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
   * @typeparam TOption  A type of option representation.
   * @typeparam TCtx  A type of option processing context required by parser.
   */
  export interface Opts<TOption extends ZOption = ZOption, TCtx = unknown> {

    /**
     * An index of command line argument to start processing from.
     */
    readonly fromIndex?: number;

    /**
     * Additional options to support.
     */
    readonly options?: SupportedZOptions<TOption, TCtx>;

  }

}

/**
 * Builds custom command line options parser.
 *
 * @typeparam TOption  A type of option representation.
 * @typeparam TCtx  A type of option processing context required by parser.
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
