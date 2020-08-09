/**
 * @packageDocumentation
 * @module @run-z/optionz
 */

/**
 * Meta information for the option.
 *
 * Can either contain {@link ZOptionMeta.Help help information}, be a reference to another option this one is an
 * {@link ZOptionMeta.Alias alias for}, or be {@link ZOptionMeta.Hidden hidden}.
 */
export type ZOptionMeta =
    | ZOptionMeta.Hidden
    | ZOptionMeta.Alias
    | ZOptionMeta.Help;

export namespace ZOptionMeta {

  /**
   * Option help information.
   */
  export interface Help {

    readonly hidden?: false;

    /**
     * Option usage description(s).
     */
    readonly usage?: string | readonly string[];

    readonly aliasOf?: undefined;

    /**
     * Brief help text.
     */
    readonly help?: string;

    /**
     * Full option description.
     */
    readonly description?: string;

  }

  /**
   * A reference to alias option.
   */
  export interface Alias {

    readonly hidden?: false;

    /**
     * Option usage descriptions(s).
     */
    readonly usage?: string | readonly string[];

    /**
     * An option name this one is alias of.
     */
    readonly aliasOf: string;

  }

  /**
   * Hidden option.
   */
  export interface Hidden {

    readonly hidden: true;

  }

  /**
   * Option help information combined from multiple sources.
   */
  export interface Combined {

    /**
     * Option usage descriptions, including aliases usage.
     *
     * May be empty for unsupported and hidden options.
     */
    readonly usage: readonly string[];

    /**
     * Brief help text.
     */
    readonly help?: string;

    /**
     * Full option description.
     */
    readonly description?: string;

  }

}
