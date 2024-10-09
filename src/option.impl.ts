import { noop } from '@proc7ts/primitives';
import { ZOptionError } from './option-error.js';
import type { ZOptionInput } from './option-input.js';
import { ZOptionLocation } from './option-location.js';
import type { ZOptionMeta } from './option-meta.js';
import type { ZOptionReader } from './option-reader.js';
import type { ZOption } from './option.js';

/**
 * @internal
 */
export class ZOptionImpl<TOption extends ZOption> {
  #args: readonly string[];
  readonly #head: readonly string[];
  #name!: string;
  #key!: string;
  #values!: readonly string[];

  #recognizedUpto!: number;
  #actions: ((this: void) => void)[] = [];
  #deferred?: ZOptionReader.Fn<TOption> | undefined;
  readonly #allDeferred: ZOptionReader.Fn<TOption>[] = [];
  #reason: unknown;
  #finalReason: unknown;

  recognized?: readonly string[] | undefined;
  #whenRecognized: (option: TOption) => void = noop;

  constructor(
    readonly optionsMeta: () => ReadonlyMap<string, ZOptionMeta.Combined>,
    args: readonly string[],
    readonly argIndex: number,
  ) {
    this.#args = args;
    this.#head = args.slice(0, argIndex);
  }

  get args(): readonly string[] {
    return this.#args;
  }

  get name(): string {
    return this.#name;
  }

  get key(): string {
    return this.#key;
  }

  get tail(): readonly [string, ...string[]] {
    return this.args.slice(this.argIndex) as readonly string[] as readonly [string, ...string[]];
  }

  setInput(input: ZOptionInput): readonly string[] {
    const { name, key = name, values = [], tail = [] } = input;

    this.#name = name;
    this.#key = key;
    this.#values = values;

    return (this.#args = [...this.#head, name, ...values, ...tail]);
  }

  async read(option: TOption, reader: ZOptionReader.Spec<TOption>): Promise<void> {
    this.#actions = [];
    this.#reason = undefined;
    if (!this.recognized) {
      this.#recognizedUpto = -1;
      this.#deferred = undefined;
    }

    await reader.read(option);

    if (this.#deferred) {
      this.#allDeferred.push(this.#deferred);
      if (this.#finalReason == null) {
        this.#finalReason = this.#reason;
      }
    } else {
      const actions = this.#actions;

      if (actions.length) {
        this.whenRecognized(() => {
          for (const action of actions) {
            action();
          }
        });
      }
      if (!this.recognized && this.#recognizedUpto >= 0) {
        this.recognized = this.args.slice(this.argIndex + 1, this.#recognizedUpto);
      }
    }
  }

  async done(option: TOption): Promise<number> {
    if (this.recognized) {
      this.#actions = [];

      for (const deferred of this.#allDeferred) {
        await deferred(option);
      }
      this.#whenRecognized(option);

      // Perform actions registered by deferred callbacks
      for (const action of this.#actions) {
        action();
      }
    } else if (this.#finalReason != null) {
      throw this.#finalReason;
    } else {
      throw new ZOptionError(
        this.optionLocation(),
        `Unrecognized command line option: "${this.name}"`,
      );
    }

    return this.#recognizedUpto;
  }

  values(rest: boolean, max?: number): readonly string[] {
    if (max != null && max < 0) {
      max = 0;
    }
    if (this.recognized) {
      return max != null && max < this.recognized.length
        ? this.recognized.slice(0, max)
        : this.recognized;
    }

    const fromIndex = this.argIndex + 1;
    const toIndex =
      max != null
        ? fromIndex + (rest ? max : Math.min(max, this.#values.length))
        : rest
          ? this.#args.length
          : fromIndex + this.#values.length;
    const result = this.args.slice(fromIndex, toIndex);

    this.#recognize(fromIndex + result.length);

    return result;
  }

  recognize(action?: (this: void) => void): void {
    if (this.#recognizedUpto < 0) {
      this.#recognize(this.argIndex + 1);
    }
    if (action) {
      this.#actions.push(action);
    }
  }

  #recognize(upto: number): void {
    this.#recognizedUpto = upto;
    this.#deferred = undefined;
    this.#reason = undefined;
  }

  defer(whenRecognized: ZOptionReader.Fn<TOption> = noop): void {
    this.#deferred = whenRecognized;
  }

  unrecognize(reason?: unknown): void {
    if (this.recognized) {
      return;
    }
    if (!this.#deferred) {
      this.#deferred = noop;
    }
    if (reason != null) {
      this.#reason = reason;
    }
    this.#recognizedUpto = -1;
    this.#actions.length = 0;
  }

  whenRecognized(receiver: (option: TOption) => void): void {
    const prevReceiver = this.#whenRecognized;

    this.#whenRecognized = values => {
      prevReceiver(values);
      receiver(values);
    };
  }

  optionLocation(init: ZOptionLocation.Init = {}): Required<ZOptionLocation> {
    return ZOptionLocation.by({
      ...init,
      index: init.index || this.argIndex,
      args: this.args,
    });
  }
}
