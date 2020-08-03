import { noop } from '@proc7ts/primitives';
import type { ZOption, ZOptionReader } from './option';
import { ZOptionError } from './option-error';
import type { ZOptionInput } from './option-input';
import { ZOptionLocation } from './option-location';

/**
 * @internal
 */
export class ZOptionImpl<TOption extends ZOption> {

  private readonly _head: readonly string[];
  private _name!: string;
  private _key!: string;
  private _values!: readonly string[];

  private _recognizedUpto!: number;
  private _deferred?: ZOptionReader<TOption>;
  private readonly _allDeferred: ZOptionReader<TOption>[] = [];

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

  async read(option: TOption, reader: ZOptionReader<TOption>): Promise<void> {
    if (!this.recognized) {
      this._recognizedUpto = -1;
      this._deferred = undefined;
    }

    await reader(option);

    if (this._deferred) {
      this._allDeferred.push(this._deferred);
    } else if (!this.recognized && this._recognizedUpto >= 0) {
      this.recognized = this.args.slice(this.argIndex + 1, this._recognizedUpto);
    }
  }

  async done(option: TOption): Promise<number> {
    for (const deferred of this._allDeferred) {
      await deferred(option);
    }

    if (this.recognized) {
      this._whenRecognized(option);
    } else {
      throw new ZOptionError(this.optionLocation(), `Unrecognized command line option: "${this.name}"`);
    }

    return this._recognizedUpto;
  }

  values(
      rest: boolean,
      max?: number,
  ): readonly string[] {
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

  private _recognize(upto: number): void {
    this._recognizedUpto = upto;
    this._deferred = undefined;
  }

  defer(whenRecognized?: ZOptionReader<TOption>): void {
    this._deferred = whenRecognized;
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

