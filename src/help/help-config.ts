import type { ZOptionMeta } from '../option-meta.js';
import type { ZOption } from '../option.js';

/**
 * Configuration for {@link helpZOptionReader help option reader}.
 *
 * @typeParam TOption  A type of help option.
 */
export interface ZHelpConfig<TOption extends ZOption = ZOption> {
  /**
   * Help display mode.
   *
   * One of:
   *
   * - `brief` to display only brief help info.
   * - `full` to display detailed help info.
   *
   * @default `detailed`
   */
  readonly mode?: 'brief' | 'detailed' | undefined;

  /**
   * Compares two options meta.
   *
   * By default sorts options by their {@link @run-z/optionz!ZOptionMeta.Help#group group} first, and then - by their
   * keys.
   *
   * @param key1 - First option key.
   * @param meta1 - First option meta.
   * @param key2 - Second option key.
   * @param meta2 - Second option meta.
   *
   * @returns Positive number if first option should be listed after the second one, negative number if first option
   * should be listed before the second one, or zero to list them in original order.
   */
  compare?(
    key1: string,
    meta1: ZOptionMeta.Combined,
    key2: string,
    meta2: ZOptionMeta.Combined,
  ): number;

  /**
   * Displays help information.
   *
   * By default prints help information formatted by {@link ZHelpFormatter help formatter} to console.
   *
   * @param options - A list of options meta to display.
   * @param option - Help option representation.
   *
   * @returns Either nothing if help displayed synchronously, or a promise-like instance resolved when help displayed
   * asynchronously.
   */
  display?(options: ZOptionMeta.List, option: TOption): void | PromiseLike<unknown>;
}
