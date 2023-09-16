/* eslint-disable @typescript-eslint/naming-convention */
import type { ZOptionReader } from './option-reader.js';
import type { ZOption } from './option.js';

/**
 * A set of options supported by {@link ZOptionsParser parser}.
 *
 * This is either a {@link SupportedZOptions.Map map of option readers}, its {@link SupportedZOptions.Provider provider
 * function}, or an array of the above. Multiple readers may be specified per option key with the latter.
 *
 * @typeParam TOption  A type of option representation.
 * @typeParam TCtx  A type of option processing context required by parser.
 */
export type SupportedZOptions<TOption extends ZOption = ZOption, TCtx = unknown> =
  | SupportedZOptions.Map<TOption>
  | SupportedZOptions.Provider<TOption, TCtx>
  | readonly (SupportedZOptions.Map<TOption> | SupportedZOptions.Provider<TOption, TCtx>)[];

export namespace SupportedZOptions {
  /**
   * A map of {@link ZOptionReader readers} corresponding to option keys or their wildcards.
   *
   * @typeParam TCtx  A type of option processing context required by parser.
   * @typeParam TOption  A type of option representation.
   */
  export interface Map<TOption extends ZOption = ZOption> {
    /**
     * Option reader method corresponding to option key.
     *
     * The latter can be either an option name, or its wildcard supported by the {@link ZOptionSyntax syntax} used.
     */
    readonly [key: string]: ZOptionReader<TOption, this> | undefined;

    /**
     * Fallback option reader consulted when none of the readers recognized the option in.
     * {@link ZOptionSyntax:var#longOptions `--name=VALUE` syntax}.
     */
    readonly '--*=*'?: ZOptionReader<TOption, this> | undefined;

    /**
     * Fallback option reader consulted when none of the readers recognized the option in
     * {@link ZOptionSyntax:var#longOptions long syntax}.
     */
    readonly '--*'?: ZOptionReader<TOption, this> | undefined;

    /**
     * Fallback option reader consulted when none of the readers recognized the option in
     * {@link ZOptionSyntax:var#shortOptions one-letter syntax}.
     */
    readonly '-?'?: ZOptionReader<TOption, this> | undefined;

    /**
     * Fallback option reader consulted when none of the readers recognized the option in
     * {@link ZOptionSyntax:var#shortOptions `-name=VALUE` syntax}.
     */
    readonly '-*=*'?: ZOptionReader<TOption, this> | undefined;

    /**
     * Fallback option reader consulted when none of the readers recognized the option in
     * {@link ZOptionSyntax:var#shortOptions short syntax}.
     */
    readonly '-*'?: ZOptionReader<TOption, this> | undefined;

    /**
     * Fallback option reader consulted when none of the readers the option in {@link ZOptionSyntax:var#any any syntax}.
     */
    readonly '*'?: ZOptionReader<TOption, this> | undefined;
  }

  /**
   * Options syntax provider signature.
   *
   * The provider is called at most once per {@link ZOptionsParser parser call}.
   *
   * @typeParam TCtx  A type of option processing context required by parser.
   * @typeParam TOption  A type of option representation.
   * @param context - Option processing context.
   *
   * @returns A {@link Map map of option readers}.
   */
  export type Provider<TOption extends ZOption = ZOption, TCtx = unknown> = (
    this: void,
    context: TCtx,
  ) => Map<TOption>;
}
