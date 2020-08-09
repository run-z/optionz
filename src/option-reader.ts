/**
 * @packageDocumentation
 * @module @run-z/optionz
 */
import type { ZOption } from './option';
import type { ZOptionMeta } from './option-meta';

/**
 * Option reader.
 *
 * This can be either a {@link ZOptionReader.Fn reader function}, or its {@link ZOptionReader.Spec full specifier}.
 *
 * @typeparam TOption  A type of command line option representation expected by reader.
 * @typeparam TThis  A type of `this` parameter.
 */
export type ZOptionReader<TOption extends ZOption, TThis = void> =
  | ZOptionReader.Fn<TOption, TThis>
  | ZOptionReader.Spec<TOption>;

export namespace ZOptionReader {

  /**
   * Option reader function (or method) signature.
   *
   * A reader function accepts a {@link ZOption command line option} corresponding to the key the reader is
   * {@link SupportedZOptions.Map registered for} and tries to recognize it.
   *
   * @typeparam TOption  A type of command line option representation expected by reader.
   * @typeparam TThis  A type of `this` parameter.
   */
  export type Fn<TOption extends ZOption, TThis = void> =
  /**
   * @param option  Command line option to recognize.
   *
   * @returns Either nothing or promise-like instance resolved when the reader finishes option processing,
   * either recognized or not.
   */
      (this: TThis, option: TOption) => void | PromiseLike<unknown>;

  /**
   * Option reader specifier.
   *
   * Contains option reader function along with meta information.
   *
   * @typeparam TOption  A type of command line option representation expected by reader.
   */
  export interface Spec<TOption extends ZOption> {

    /**
     * Reads and tries to recognize the option.
     */
    readonly read: Fn<TOption, this>;

    /**
     * Option meta information.
     */
    readonly meta?: ZOptionMeta;

  }

}
