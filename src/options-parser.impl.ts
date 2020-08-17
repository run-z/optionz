import { arrayOfElements, lazyValue } from '@proc7ts/primitives';
import type { ZOption } from './option';
import { ZOptionBase } from './option-base.impl';
import type { ZOptionMeta } from './option-meta';
import type { ZOptionReader } from './option-reader';
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
   * @param options  Additional options to support.
   *
   * @returns A promise resolved to processing context when parsing completes.
   */
  async parseOptions(
      context: TCtx,
      args: readonly string[],
      {
        fromIndex = 0,
        options,
      }: {
        fromIndex?: number;
        options?: SupportedZOptions<TOption, TCtx>;
      } = {},
  ): Promise<TCtx> {

    const allOptions = supportedZOptionsMap(
        context,
        arrayOfElements(this._config.options).concat(arrayOfElements(options)),
    );
    const optionMeta = lazyValue(() => supportedZOptionsMeta(allOptions));
    const optionClass = this.optionClass;
    const syntax = this.syntax;

    for (let argIndex = Math.max(0, fromIndex); argIndex < args.length;) {

      const impl = new ZOptionImpl<TOption>(optionMeta, args, argIndex);
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
          const readers = allOptions.get(key) || [];

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
    supportedOptions: readonly (SupportedZOptions.Map<TOption> | SupportedZOptions.Provider<TOption, TCtx>)[],
): Map<string, ZOptionReader.Spec<TOption>[]> {

  const result = new Map<string, ZOptionReader.Spec<TOption>[]>();

  for (const supported of supportedOptions) {

    const map: SupportedZOptions.Map<TOption> = typeof supported === 'function'
        ? supported(context)
        : supported;

    for (const [option, reader] of Object.entries(map)) {
      if (!reader) {
        continue;
      }

      let spec: ZOptionReader.Spec<TOption>;

      if (typeof reader === 'function') {
        spec = {
          read: reader.bind(map),
        };
      } else {
        spec = reader;
      }

      const readers = result.get(option);

      if (readers) {
        readers.push(spec);
      } else {
        result.set(option, [spec]);
      }
    }
  }

  return result;
}

/**
 * @internal
 */
function supportedZOptionsMeta<TOption extends ZOption>(
    options: ReadonlyMap<string, readonly ZOptionReader.Spec<TOption>[]>,
): ReadonlyMap<string, ZOptionMeta.Combined> {

  interface CombinedZOptionMeta {
    usage: string[];
    help?: string;
    description?: string;
  }

  const result = new Map<string, CombinedZOptionMeta>();

  for (const [readerKey, specs] of options) {
    for (const spec of specs) {

      const { meta = {} } = spec;
      let help: ZOptionMeta.Help;
      let canonicalKey: string;

      if (meta.hidden) {
        continue;
      }
      if (meta.aliasOf != null) {
        canonicalKey = meta.aliasOf;
        help = { usage: meta.usage };
      } else {
        canonicalKey = readerKey;
        help = meta;
      }

      const usage = Array.from(arrayOfElements(help.usage));
      const existing = result.get(canonicalKey);

      if (existing) {
        if (usage.length) {
          existing.usage.push(...usage);
        } else if (!existing.usage.includes(readerKey)) {
          existing.usage.push(readerKey);
        }
        if (!existing.help) {
          existing.help = help.help;
        }
        if (!existing.description) {
          existing.description = help.description;
        }
      } else {
        if (!usage.length) {
          usage.push(readerKey);
        }
        result.set(canonicalKey, { ...help, usage });
      }
    }
  }

  return result;
}

