import { valueProvider } from '@proc7ts/primitives';
import type { ChalkInstance } from 'chalk';
import chalk from 'chalk';
import type { ZColors } from './colors.js';

/**
 * Terminal color theme relying on [chalk](https://www.npmjs.com/package/chalk).
 *
 * This theme is used {@link ZColors.useByDefault by default}.
 */
export class ChalkZColors implements ZColors {

  /**
   * Chalk instance to use.
   */
  chalk(): ChalkInstance {
    return (this.chalk = valueProvider(chalk))();
  }

  usage(text: string): string {
    return this.chalk().green(text);
  }

  param(name: string): string {
    return this.sign('\u276c') + this.chalk().cyan.bold(name) + this.sign('\u276d');
  }

  sign(sign: string): string {
    return this.chalk().dim.white(sign);
  }

  optional(text: string): string {
    return this.sign('[') + text + this.sign(']');
  }

  bullet(sign = '\u2023'): string {
    return `  ${sign}`;
  }

}
