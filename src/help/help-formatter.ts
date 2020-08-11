/**
 * @packageDocumentation
 * @module @run-z/optionz/help
 */
import { flatMapIt, itsReduction } from '@proc7ts/a-iterable';
import { valueProvider } from '@proc7ts/primitives';
import type { Chalk } from 'chalk';
import type { ZOptionMeta } from '../option-meta';

/**
 * Options help printer.
 *
 * Requires [chalk], [cliui], and [string-width].
 *
 * [chalk]: https://www.npmjs.com/package/chalk
 * [cliui]: https://www.npmjs.com/package/cliui
 * [string-width]: https://www.npmjs.com/package/string-width
 */
export class ZHelpFormatter {

  chalk(): Chalk {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return (this.chalk = valueProvider(require('chalk')))();
  }

  /**
   * Formats option usage text.
   *
   * @param text  Original usage text.
   *
   * @returns Formatted usage text.
   */
  usage(text: string): string {
    return this.chalk().green(text);
  }

  /**
   * Detects usage column width.
   *
   * @param options  A list of options meta to format.
   */
  usageWidth(options: ZOptionMeta.List): number {

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const stringWidth = require('string-width');

    return itsReduction(
        flatMapIt(
            options,
            ([, { usage }]) => usage,
        ),
        (prev, usage) => Math.max(prev, stringWidth(usage)),
        0,
    );
  }

  /**
   * Paddings for usage column.
   *
   * @return top, right, bottom, and left paddings.
   */
  usagePadding(): readonly [number, number, number, number] {
    return [1, 1, 0, 2];
  }

  /**
   * Paddings for text column.
   *
   * @return top, right, bottom, and left paddings.
   */
  textPadding(): readonly [number, number, number, number] {
    return [1, 0, 0, 1];
  }

  /**
   * Formats options help information.
   *
   * @param options  A list of options meta to display.
   *
   * @returns A promise resolved to formatted help text.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async help(options: ZOptionMeta.List): Promise<string> {

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cliui = require('cliui');
    const ui = cliui();
    const usagePadding = this.usagePadding();
    const usageWidth = this.usageWidth(options) + usagePadding[1] + usagePadding[3];

    for (const [, meta] of options) {

      const usageText = meta.usage.map(usage => this.usage(usage)).join('\n');
      const { help, description = '' } = meta;
      let text: string;

      if (help) {
        if (description) {
          text = `${help.trim()}\n\n${description.trim()}`;
        } else {
          text = help.trim();
        }
      } else {
        text = description.trim();
      }

      ui.div(
          {
            text: usageText,
            width: usageWidth,
            padding: usagePadding,
          },
          {
            text,
            padding: this.textPadding(),
          },
      );
    }

    return ui.toString();
  }

}

