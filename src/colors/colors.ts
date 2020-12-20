/**
 * @packageDocumentation
 * @module @run-z/optionz/colors
 */
import { lazyValue, valueProvider } from '@proc7ts/primitives';
import { ChalkZColors } from './chalk-colors';

/**
 * Terminal color theme to use for text formatting.
 */
export interface ZColors {

  /**
   * Formats option usage text.
   *
   * @param text - Original usage text.
   *
   * @returns Formatted usage text.
   */
  usage(text: string): string;

  /**
   * Formats option parameter placeholder.
   *
   * @param name - Parameter name.
   *
   * @returns Formatted placeholder.
   */
  param(name: string): string;

  /**
   * Formats a sign to use as part of grammar definition.
   *
   * @param sign - A sign to format.
   *
   * @returns Formatted sign.
   */
  sign(sign: string): string;

  /**
   * Formats optional part of grammar definition.
   *
   * @param text - Optional grammar text.
   *
   * @returns Formatted optional grammar.
   */
  optional(text: string): string;

  /**
   * Formats a list bullet.
   *
   * @param sign - Override bullet symbol to use.
   *
   * @returns Formatted bullet.
   */
  bullet(sign?: string): string;

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

  param(name: string): string {
    return defaultZColors().param(name);
  }

  sign(sign: string): string {
    return defaultZColors().sign(sign);
  }

  optional(text: string): string {
    return defaultZColors().optional(text);
  }

  bullet(sign?: string): string {
    return defaultZColors().bullet(sign);
  }

}

export const ZColors = {

  /**
   * Assigns terminal color theme to use {@link clz by default}.
   *
   * @param colors - New default terminal color theme to use.
   */
  useByDefault(colors: ZColors): void {
    defaultZColors = valueProvider(colors);
  },

};

/**
 * Terminal color theme that delegates to {@link ZColors.useByDefault default one}.
 */
export const clz: ZColors = (/*#__PURE__*/ new DefaultZColors());
