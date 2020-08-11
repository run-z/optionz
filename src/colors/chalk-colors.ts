/**
 * @packageDocumentation
 * @module @run-z/optionz/colors
 */
import { valueProvider } from '@proc7ts/primitives';
import type { Chalk } from 'chalk';
import type { ZColors } from './colors';

/**
 * Console color theme relying on [chalk](https://www.npmjs.com/package/chalk).
 *
 * This theme is used {@link ZColors.useByDefault by default}.
 */
export class ChalkZColors implements ZColors {

  /**
   * Chalk instance to use.
   */
  chalk(): Chalk {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return (this.chalk = valueProvider(require('chalk')))();
  }

  usage(text: string): string {
    return this.chalk().green(text);
  }

}
