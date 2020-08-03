/**
 * @packageDocumentation
 * @module @run-z/optionz
 */

/**
 * The location of the option(s) within command line.
 */
export interface ZOptionLocation {

  /**
   * Command line arguments containing target option(s).
   */
  readonly args: readonly string[];

  /**
   * An index of the first command line argument containing the option.
   */
  readonly index: number;

  /**
   * An index of command line arguments up to which the command line contains option(s).
   *
   * @default Next to `index`. I.e. `index + 1`.
   */
  readonly endIndex?: number;

  /**
   * An offset of relevant characters within the first command line argument.
   *
   * @default First character. I.e. `0`.
   */
  readonly offset?: number;

  /**
   * The end offset of relevant characters within the last command line argument.
   *
   * @default The length of the last command line argument. I.e. `args[endIndex - 1].length`.
   */
  readonly endOffset?: number;

}

export namespace ZOptionLocation {

  /**
   * Initial properties of option location.
   */
  export interface Init {

    /**
     * An index of the first command line argument containing the option.
     *
     * @default {@link ZOption.argIndex}
     */
    readonly index?: number;

    /**
     * An index of command line arguments up to which the command line contains option(s).
     *
     * @default Next to `index`. I.e. `index + 1`.
     */
    readonly endIndex?: number;

    /**
     * An offset of relevant characters within the first command line argument.
     *
     * @default First character. I.e. `0`.
     */
    readonly offset?: number;

    /**
     * The end offset of relevant characters within the last command line argument.
     *
     * @default The length of the last command line argument. I.e. `args[endIndex - 1].length`.
     */
    readonly endOffset?: number;

  }

}

export const ZOptionLocation = {

  /**
   * Reconstructs option location.
   *
   * @param location  Option location.
   *
   * @returns Reconstructed option location with all properties set.
   */
  by(location: ZOptionLocation): Required<ZOptionLocation> {

    const { args } = location;
    const index = Math.max(location.index, 0);

    if (index >= args.length) {
      // The index is after the last argument
      return {
        args,
        index: args.length,
        endIndex: args.length,
        offset: 0,
        endOffset: 0,
      };
    }

    let { endIndex = index + 1, offset = 0 } = location;

    endIndex = Math.min(Math.max(endIndex, index + 1), args.length);
    offset = Math.min(Math.max(offset, 0), args[index].length);

    const lastLength = args[endIndex - 1].length;
    let { endOffset = lastLength } = location;

    endOffset = Math.min(Math.max(endOffset, 0), lastLength);
    if (index <= endIndex - 1 && endOffset < offset) {
      endOffset = offset;
    }

    return { args, index, endIndex, offset, endOffset };
  },

};
