/**
 * @packageDocumentation
 * @module @run-z/optionz
 */

/**
 * Meta information for the option.
 *
 * Can be either {@link ZOptionMeta.Help help information}, or a reference to {@link ZOptionMeta.Alias alias option}.
 */
export type ZOptionMeta = ZOptionMeta.Help | ZOptionMeta.Alias;

export namespace ZOptionMeta {

  /**
   * Option help information.
   */
  export interface Help {

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
   * Option help information combined from multiple sources.
   */
  export interface Combined {

    /**
     * Option usage descriptions, including aliases usage.
     *
     * May be empty only for unsupported option.
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
