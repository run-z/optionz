/**
 * @packageDocumentation
 * @module @run-z/optionz/colors
 */
import type { ColorSupport } from 'chalk';
import type { ZOption } from '../option';

/**
 * Chalk color options configuration.
 *
 * @typeparam TOption  A type of color option.
 */
export interface ChalkZColorConfig<TOption extends ZOption> {

  /**
   * Forces terminal colors support.
   *
   * Assigns `chalk.level` by default.
   *
   * @param mode - Color support mode (off, basic, 256, or 16m/TrueColor).
   * @param option - Color support option.
   *
   * @returns Either nothing if color support enabled synchronously, or a promise-like instance resolved when color
   * support enabled asynchronously.
   */
  forceColors?(mode: ColorSupport, option: TOption): void | PromiseLike<unknown>;

}
