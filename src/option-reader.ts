import type { ZOptionMeta } from './option-meta.js';
import type { ZOption } from './option.js';

/**
 * Option reader.
 *
 * This can be either a {@link ZOptionReader.Fn reader function}, or its {@link ZOptionReader.Spec full specifier}.
 *
 * @typeParam TOption  A type of command line option representation expected by reader.
 * @typeParam TThis  A type of `this` parameter.
 */
export type ZOptionReader<TOption extends ZOption = ZOption, TThis = void> =
  | ZOptionReader.Fn<TOption, TThis>
  | ZOptionReader.Spec<TOption>;

export namespace ZOptionReader {
  /**
   * Option reader function (or method) signature.
   *
   * A reader function accepts a {@link ZOption command line option} corresponding to the key the reader is
   * {@link SupportedZOptions.Map registered for} and tries to recognize it.
   *
   * @typeParam TOption  A type of command line option representation expected by reader.
   * @typeParam TThis  A type of `this` parameter.
   * @param option - Command line option to recognize.
   *
   * @returns Either nothing or promise-like instance resolved when the reader finishes option processing,
   * either recognized or not.
   */
  export type Fn<TOption extends ZOption = ZOption, TThis = unknown> = (
    this: TThis,
    option: TOption,
  ) => void | PromiseLike<unknown>;

  /**
   * Option reader specifier.
   *
   * Contains option reader function along with meta information.
   *
   * @typeParam TOption  A type of command line option representation expected by reader.
   */
  export interface Spec<TOption extends ZOption = ZOption> {
    /**
     * Reads and tries to recognize the option.
     */
    readonly read: Fn<TOption, this>;

    /**
     * Option meta information.
     */
    readonly meta?: ZOptionMeta | undefined;
  }
}
