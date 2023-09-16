import process from 'node:process';
import stringWidth from 'string-width';
import wrapAnsi from 'wrap-ansi';
import { clz } from '../colors/colors.js';
import type { ZOptionMeta } from '../option-meta.js';

/**
 * Options help printer used {@link ZHelpConfig.display by default}.
 */
export class ZHelpFormatter {

  /**
   * Detects usage column width.
   *
   * @param options - A list of options meta to format.
   */
  usageWidth(options: ZOptionMeta.List): number {
    return options
      .flatMap(([, { usage }]) => usage)
      .reduce((prev, usage) => Math.max(prev, stringWidth(usage)), 0);
  }

  /**
   * Paddings for usage column.
   *
   * @return top, right, bottom, and left paddings.
   */
  usagePadding(): readonly [top: number, right: number, bottom: number, left: number] {
    return [1, 1, 0, 2];
  }

  /**
   * Paddings for text column.
   *
   * @return top, right, bottom, and left paddings.
   */
  textPadding(): readonly [top: number, right: number, bottom: number, left: number] {
    return [1, 0, 0, 1];
  }

  /**
   * Formats options help information.
   *
   * @param options - A list of options meta to display.
   *
   * @returns A promise resolved to formatted help text.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async help(options: ZOptionMeta.List): Promise<string> {
    let out = '';
    const usagePadding = this.usagePadding();
    const usageTop = emptyLines(usagePadding[0]);
    const usageBottom = usagePadding[2];
    const usageLeft = ' '.repeat(usagePadding[3]);
    const usageRight = ' '.repeat(usagePadding[1]);
    const usageWidth = this.usageWidth(options);

    const textPadding = this.textPadding();
    const textTop = emptyLines(textPadding[0]);
    const textBottom = textPadding[2];
    const textLeft = ' '.repeat(textPadding[3]);
    const textRight = ' '.repeat(textPadding[1]);

    for (let optionIdx = 0; optionIdx < options.length; ++optionIdx) {
      const [, meta] = options[optionIdx];
      const usageLines = meta.usage.map(usage => clz.usage(usage));
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

      const textLines = wrapLines(
        text,
        (process.stdout.columns || 80)
          - usageWidth
          - usagePadding[1]
          - usagePadding[3]
          - textPadding[1]
          - textPadding[3],
      );

      if (optionIdx) {
        // Top padding
        usageLines.splice(0, 0, ...usageTop);
        textLines.splice(0, 0, ...textTop);
      }

      let numUsageLines = usageLines.length;
      let numTextLines = textLines.length;

      if (optionIdx + 1 < options.length) {
        // Bottom padding
        numUsageLines += usageBottom;
        numTextLines += textBottom;
      }

      const numLines = Math.max(numUsageLines, numTextLines);

      for (let lineIdx = 0; lineIdx < numLines; ++lineIdx) {
        out +=
          usageLeft
          + padLine(usageLines[lineIdx] || '', usageWidth)
          + usageRight
          + textLeft
          + (textLines[lineIdx] || '')
          + textRight
          + '\n';
      }
    }

    return out;
  }

}

/**
 * @internal
 */
function wrapLines(text: string, columns: number): string[] {
  return wrapAnsi(text, columns, { hard: true, trim: false }).split('\n');
}

/**
 * @internal
 */
function emptyLines(numLines: number): readonly string[] {
  const result: string[] = [];

  for (let i = 0; i < numLines; ++i) {
    result.push('');
  }

  return result;
}

/**
 * @internal
 */
function padLine(line: string, columns: number): string {
  return line + ' '.repeat(columns - stringWidth(line));
}
