/**
 * @packageDocumentation
 * @module @run-z/optionz/help
 */
import { flatMapIt, itsReduction } from '@proc7ts/a-iterable';
import cliui from 'cliui';
import stringWidth from 'string-width';
import { clz } from '../colors';
import type { ZOptionMeta } from '../option-meta';

/**
 * Options help printer used {@link ZHelpConfig.display by default}.
 */
export class ZHelpFormatter {

  /**
   * Detects usage column width.
   *
   * @param options  A list of options meta to format.
   */
  usageWidth(options: ZOptionMeta.List): number {
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

    const ui = cliui();
    const usagePadding = this.usagePadding();
    const usageWidth = this.usageWidth(options) + usagePadding[1] + usagePadding[3];

    for (const [, meta] of options) {

      const usageText = meta.usage.map(usage => clz.usage(usage)).join('\n');
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

