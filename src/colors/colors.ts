/**
 * @packageDocumentation
 * @module @run-z/optionz/colors
 */
import { lazyValue, valueProvider } from '@proc7ts/primitives';
import { ChalkZColors } from './chalk-colors';

/**
 * Console color theme to use for text formatting.
 */
export interface ZColors {

  /**
   * Formats option usage text.
   *
   * @param text  Original usage text.
   *
   * @returns Formatted usage text.
   */
  usage(text: string): string;

}

/**
 * @internal
 */
let defaultZColors: () => ZColors = (/*#__PURE__*/ lazyValue(() => new ChalkZColors()));

/**
 * @internal
 */
class DefaultZColors implements ZColors {

  usage(text: string): string {
    return defaultZColors().usage(text);
  }

}

export const ZColors = {

  /**
   * Assigns console color theme to use {@link clz by default}.
   *
   * @param colors  New default console color theme to use.
   */
  useByDefault(colors: ZColors): void {
    defaultZColors = valueProvider(colors);
  },

};

/**
 * Console color theme that delegates to {@link ZColors.useByDefault default one}.
 */
export const clz: ZColors = (/*#__PURE__*/ new DefaultZColors());
