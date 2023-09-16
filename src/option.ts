import type { ZOptionLocation } from './option-location';
import type { ZOptionMeta } from './option-meta';
import type { ZOptionReader } from './option-reader';

/**
 * Base representation of command line option passed to its {@link ZOptionReader reader} in order to be recognized.
 *
 * A class implementing this interface along with any interface specific to the parser is created by
 * {@link ZOptionsParser.Config.optionClass} method.
 *
 * The {@link ZOptionReader reader} uses option methods to recognize and consume command line arguments. Once recognized
 * these arguments are consumed, and option reading continues from the next non-consumed argument.
 *
 * If multiple readers correspond to the same option key, they all consulted in order. Once one of them recognized the
 * option, the remaining and {@link defer deferred} ones receive an option instance representing already consumed
 * option. The latter can be read by readers, but can no longer be updated.
 */
export interface ZOption {
  /**
   * Option name.
   *
   * This is a command line {@link args argument} at {@link argIndex currently processed index}.
   */
  readonly name: string;

  /**
   * Option key used to find corresponding option readers.
   *
   * This may be the same as [name], or may be e.g. a wildcard key when no readers for the option name recognized it.
   * In any case, the option key is {@link ZOptionInput.key syntax-specific}.
   */
  readonly key: string;

  /**
   * Command line arguments the option is read from.
   *
   * These arguments may be updated by {@link ZOptionSyntax option syntax} between the read attempts.
   */
  readonly args: readonly string[];

  /**
   * An index of the first command line argument the reader should recognized.
   */
  readonly argIndex: number;

  /**
   * Reads up to the maximum number of values of the option.
   *
   * Values are command line options following the {@link argIndex currently processed one}. Their number depend on the
   * {@link ZOptionSyntax option syntax}. E.g. a `--name=value` syntax supports one value, while
   * `--name value1 value2 ...` syntax supports any number of them.
   *
   * Calling this method marks the option and value arguments as {@link recognize recognized}. This can be undone
   * by calling any recognition method again.
   *
   * When called on already recognized option this method just returns the values previously returned to the reader
   * that recognized them.
   *
   * @param max - The maximum number of values to read.
   *
   * @returns Option values array.
   */
  values(max?: number): readonly string[];

  /**
   * Reads up to the maximum number of the remaining command line arguments and treat them as option values.
   *
   * Reads [values] and all command line arguments following them up to the end of command line or their maximum number.
   *
   * Calling this method marks all arguments read as {@link recognize recognized}. This can be undone by calling
   * any recognition method again.
   *
   * When called on already recognized option this method just returns the values previously returned to the reader
   * that recognized them.
   *
   * @param max - The maximum number of arguments to read.
   *
   * @returns Command line arguments array.
   */
  rest(max?: number): readonly string[];

  /**
   * Marks current option as recognized.
   *
   * This method is called by [rest] and [values].
   *
   * This method can be called multiple times to register multiple actions to call. These actions won't be called once
   * the option is marked as {@link unrecognize unrecognized} again.
   *
   * @param action - The action to perform when the option recognized and all readers processed.
   */
  recognize(action?: (this: void) => void): void;

  /**
   * Defers the option processing until recognized by another reader available for the same option key.
   *
   * Calling this method marks arguments as unrecognized. This can be changed by calling any recognition method again.
   * The already registered callback will be unregistered on such call.
   *
   * @param whenRecognized - Optional callback function that will be called when option recognized by another reader.
   */
  defer(whenRecognized?: ZOptionReader.Fn<this>): void;

  /**
   * Marks current option as unrecognized.
   *
   * This method is called by [defer].
   *
   * When calling without parameter the previous reason is not updated.
   *
   * Does nothing if current option is recognized by another reader.
   *
   * @param reason - An error to throw when all readers processed and option is still unrecognized. When omitted,
   * the {@link ZOptionError} will be thrown.
   */
  unrecognize(reason?: unknown): void;

  /**
   * Allows to await for option recognition.
   *
   * Calling this method does not alter option recognition status in any way, unlike {@link defer recognition
   * deferring}. An unlike deferring, the callback registered by this method will be called when the option recognized
   * by any reader, not just the readers registered for the same option key.
   *
   * @param receiver - Callback function that will be called when the option recognized and all readers processed.
   */
  whenRecognized(receiver: (this: void, option: this) => void): void;

  /**
   * Builds option location within parsed command line.
   *
   * @param init - Initial properties of option location.
   *
   * @returns Option location within parsed command line arguments.
   */
  optionLocation(init?: ZOptionLocation.Init): Required<ZOptionLocation>;

  /**
   * Lists all options supported by the parser.
   *
   * @returns A read-only array of all supported option keys except hidden ones.
   */
  supportedOptions(): readonly string[];

  /**
   * Returns meta information for option.
   *
   * @param key - Option key.
   *
   * @returns Combined meta information for the option with the given key.
   */
  optionMeta(key: string): ZOptionMeta.Combined;
}

export namespace ZOption {
  /**
   * A class constructor implementing a command line option representation.
   *
   * This is a class to extend by {@link ZOptionsParser.Config.optionClass options parser}.
   *
   * @typeParam TArgs  A type of constructor arguments.
   */
  export interface BaseClass<TArgs extends any[]> {
    prototype: ZOption;

    new (...args: TArgs): ZOption;
  }

  /**
   * A class constructor representing a parser-specific implementation of the command line option.
   *
   * @typeParam TOption  Parser-specific command line option interface implemented by this class.
   * @typeParam TCtx  A type of option processing context required by parser.
   * @typeParam TArgs  A type of arguments to pass to the {@link BaseClass base constructor}.
   */
  export interface ImplClass<TOption extends ZOption, TCtx, TArgs extends any[]> {
    prototype: TOption;

    /**
     * Constructs command line option representation.
     *
     * @param context - Option processing context.
     * @param args - Arguments to pass to the {@link BaseClass base constructor}.
     */
    new (context: TCtx, ...args: TArgs): TOption;
  }
}
