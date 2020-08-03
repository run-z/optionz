import { arrayOfElements } from '@proc7ts/primitives';
import type { ZOption, ZOptionReader } from './option';
import { ZOptionBase } from './option-base.impl';
import { ZOptionSyntax } from './option-syntax';
import { ZOptionImpl } from './option.impl';
import type { ZOptionsParser } from './options-parser';
import type { SupportedZOptions } from './supported-options';

/**
 * Command line options parser.
 *
 * @internal
 * @typeparam TCtx  A type of option processing context required by parser.
 * @typeparam TOption  A type of option representation.
 */
export class ZOptionsParser$<TOption extends ZOption, TCtx> {

  private readonly _config: ZOptionsParser.Config<TOption, TCtx>;
  private _options?: (this: void, context: TCtx) => Map<string, ZOptionReader<TOption>[]>;
  private _syntax?: ZOptionSyntax;
  private _optionClass?: ZOption.ImplClass<TOption, TCtx, [ZOptionImpl<TOption>]>;

  /**
   * Constructs command line options parser.
   *
   * @param config  Command line options configuration.
   */
  constructor(config: ZOptionsParser.Config<TOption, TCtx>) {
    this._config = config;
  }

  private get options(): (this: void, context: TCtx) => Map<string, readonly ZOptionReader<TOption>[]> {
    if (this._options) {
      return this._options;
    }
    return this._options = context => supportedZOptionsMap(context, this._config.options);
  }

  /**
   * Command line option representation class constructor.
   */
  get optionClass(): ZOption.ImplClass<TOption, TCtx, [ZOptionImpl<TOption>]> {
    if (this._optionClass) {
      return this._optionClass;
    }
    return this._optionClass = this._config.optionClass(ZOptionBase as ZOption.BaseClass<any>);
  }

  /**
   * Command line options syntax.
   */
  get syntax(): ZOptionSyntax {
    if (this._syntax) {
      return this._syntax;
    }

    const { syntax } = this._config;

    return this._syntax = syntax ? ZOptionSyntax.by(syntax) : ZOptionSyntax.default;
  }

  /**
   * Parses command line options.
   *
   * @param context  Options processing context. This context is supposed to receive the processing results.
   * @param args  Array of command line arguments
   * @param fromIndex  An index of command line argument to start processing from.
   *
   * @returns A promise resolved to processing context when parsing completes.
   */
  async parseOptions(
      context: TCtx,
      args: readonly string[],
      fromIndex = 0,
  ): Promise<TCtx> {

    const options = this.options(context);
    const optionClass = this.optionClass;
    const syntax = this.syntax;

    for (let argIndex = Math.max(0, fromIndex); argIndex < args.length;) {

      const impl = new ZOptionImpl<TOption>(args, argIndex);
      const option = new optionClass(context, impl);

      let retry: boolean;

      do {
        retry = false;
        for (const input of syntax(impl.tail)) {
          args = impl.setInput(input);

          if (input.retry) {
            retry = true;
            break; // Apply replacement
          }

          const { key = input.name } = input;
          const readers = options.get(key) || [];

          for (const reader of readers) {
            await impl.read(option, reader);
          }
          if (impl.recognized) {
            break;
          }
        }
      } while (retry);

      argIndex = await impl.done(option);
    }

    return context;
  }

}

/**
 * @internal
 */
function supportedZOptionsMap<TOption extends ZOption, TCtx>(
    context: TCtx,
    supportedOptions: SupportedZOptions<TOption, TCtx>,
): Map<string, ZOptionReader<TOption>[]> {

  const result = new Map<string, ZOptionReader<TOption>[]>();

  for (const supported of arrayOfElements(supportedOptions)) {

    const map: SupportedZOptions.Map<TOption> = typeof supported === 'function'
        ? supported(context)
        : supported;

    for (const [option, reader] of Object.entries(map)) {
      if (!reader) {
        continue;
      }

      const r = reader.bind(map);
      const readers = result.get(option);

      if (readers) {
        readers.push(r);
      } else {
        result.set(option, [r]);
      }
    }
  }

  return result;
}

