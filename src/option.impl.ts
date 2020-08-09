import { noop } from '@proc7ts/primitives';
import type { ZOption } from './option';
import { ZOptionError } from './option-error';
import type { ZOptionInput } from './option-input';
import { ZOptionLocation } from './option-location';
import type { ZOptionReader } from './option-reader';

/**
 * @internal
 */
export class ZOptionImpl<TOption extends ZOption> {

  private readonly _head: readonly string[];
  private _name!: string;
  private _key!: string;
  private _values!: readonly string[];

  private _recognizedUpto!: number;
  private _actions: ((this: void) => void)[] = [];
  private _deferred?: ZOptionReader.Fn<TOption>;
  private readonly _allDeferred: ZOptionReader.Fn<TOption>[] = [];
  private _reason: any;
  private _finalReason: any;

  recognized?: readonly string[];
  private _whenRecognized: (option: TOption) => void = noop;

  constructor(private _args: readonly string[], readonly argIndex: number) {
    this._head = _args.slice(0, argIndex);
  }

  get args(): readonly string[] {
    return this._args;
  }

  get name(): string {
    return this._name;
  }

  get key(): string {
    return this._key;
  }

  get tail(): readonly [string, ...string[]] {
    return this.args.slice(this.argIndex) as readonly string[] as readonly [string, ...string[]];
  }

  setInput(input: ZOptionInput): readonly string[] {

    const { name, key = name, values = [], tail = [] } = input;

    this._name = name;
    this._key = key;
    this._values = values;

    return this._args = [...this._head, name, ...values, ...tail];
  }

  async read(option: TOption, reader: ZOptionReader.Fn<TOption>): Promise<void> {
    this._actions = [];
    this._reason = undefined;
    if (!this.recognized) {
      this._recognizedUpto = -1;
      this._deferred = undefined;
    }

    await reader(option);

    if (this._deferred) {
      this._allDeferred.push(this._deferred);
      if (this._finalReason == null) {
        this._finalReason = this._reason;
      }
    } else {

      const actions = this._actions;

      if (actions.length) {
        this.whenRecognized(() => {
          for (const action of actions) {
            action();
          }
        });
      }
      if (!this.recognized && this._recognizedUpto >= 0) {
        this.recognized = this.args.slice(this.argIndex + 1, this._recognizedUpto);
      }
    }
  }

  async done(option: TOption): Promise<number> {
    if (this.recognized) {
      this._actions = [];

      for (const deferred of this._allDeferred) {
        await deferred(option);
      }
      this._whenRecognized(option);

      // Perform actions registered by deferred callbacks
      for (const action of this._actions) {
        action();
      }
    } else if (this._finalReason != null) {
      throw this._finalReason;
    } else {
      throw new ZOptionError(this.optionLocation(), `Unrecognized command line option: "${this.name}"`);
    }

    return this._recognizedUpto;
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
    const toIndex = max != null
        ? fromIndex + (rest ? max : Math.min(max, this._values.length))
        : (rest ? this._args.length : fromIndex + this._values.length);
    const result = this.args.slice(fromIndex, toIndex);

    this._recognize(fromIndex + result.length);

    return result;
  }

  recognize(action?: (this: void) => void): void {
    if (this._recognizedUpto < 0) {
      this._recognize(this.argIndex + 1);
    }
    if (action) {
      this._actions.push(action);
    }
  }

  private _recognize(upto: number): void {
    this._recognizedUpto = upto;
    this._deferred = undefined;
    this._reason = undefined;
  }

  defer(whenRecognized: ZOptionReader.Fn<TOption> = noop): void {
    this._deferred = whenRecognized;
  }

  unrecognize(reason?: any): void {
    if (this.recognized) {
      return;
    }
    if (!this._deferred) {
      this._deferred = noop;
    }
    if (reason != null) {
      this._reason = reason;
    }
    this._recognizedUpto = -1;
    this._actions.length = 0;
  }

  whenRecognized(receiver: (option: TOption) => void): void {

    const prevReceiver = this._whenRecognized;

    this._whenRecognized = values => {
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

