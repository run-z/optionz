/**
 * Meta information for the option.
 *
 * Can either contain {@link ZOptionMeta.Help help information}, be a reference to another option this one is an
 * {@link ZOptionMeta.Alias alias for}, or be {@link ZOptionMeta.Hidden hidden}.
 */
export type ZOptionMeta = ZOptionMeta.Hidden | ZOptionMeta.Alias | ZOptionMeta.Help;

export namespace ZOptionMeta {
  /**
   * Option help information.
   */
  export interface Help {
    readonly hidden?: false | undefined;

    /**
     * Option usage description(s).
     */
    readonly usage?: string | readonly string[] | undefined;

    readonly aliasOf?: undefined;

    /**
     * Brief help text.
     */
    readonly help?: string | undefined;

    /**
     * Full option description.
     */
    readonly description?: string | undefined;

    /**
     * The group the option belongs to.
     *
     * Used when sorting options.
     */
    readonly group?: string | undefined;
  }

  /**
   * A reference to alias option.
   */
  export interface Alias {
    readonly hidden?: false | undefined;

    /**
     * Option usage descriptions(s).
     */
    readonly usage?: string | readonly string[] | undefined;

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
    readonly help?: string | undefined;

    /**
     * Full option description.
     */
    readonly description?: string | undefined;

    /**
     * The group the option belongs to.
     *
     * Used when sorting options.
     */
    readonly group?: string | undefined;
  }

  /**
   * A list of options meta information.
   *
   * A read-only array of key/meta tuples.
   */
  export type List = readonly (readonly [string, Combined])[];
}
