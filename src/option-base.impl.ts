import type { ZOption } from './option';
import type { ZOptionLocation } from './option-location';
import type { ZOptionMeta } from './option-meta';
import type { ZOptionReader } from './option-reader';
import type { ZOptionImpl } from './option.impl';

/**
 * @internal
 */
export class ZOptionBase<TOption extends ZOption> implements ZOption {

  constructor(private readonly _impl: ZOptionImpl<TOption>) {
  }

  get name(): string {
    return this._impl.name;
  }

  get key(): string {
    return this._impl.key;
  }

  get args(): readonly string[] {
    return this._impl.args;
  }

  get argIndex(): number {
    return this._impl.argIndex;
  }

  values(max?: number): readonly string[] {
    this.recognize();
    return this._impl.values(false, max);
  }

  rest(max?: number): readonly string[] {
    this.recognize();
    return this._impl.values(true, max);
  }

  recognize(action?: (this: void) => void): void {
    return this._impl.recognize(action);
  }

  defer(whenRecognized?: ZOptionReader.Fn<this>): void {
    this.unrecognize();
    this._impl.defer(whenRecognized as ZOptionReader.Fn<any>);
  }

  unrecognize(reason?: any): void {
    this._impl.unrecognize(reason);
  }

  whenRecognized(receiver: (this: void, option: this) => void): void {
    this._impl.whenRecognized(receiver as (option: any) => void);
  }

  optionLocation(init?: ZOptionLocation.Init): Required<ZOptionLocation> {
    return this._impl.optionLocation(init);
  }

  supportedOptions(): Iterable<string> {
    return this._impl.optionsMeta().keys();
  }

  optionMeta(key: string): ZOptionMeta.Combined {
    return this._impl.optionsMeta().get(key) || { usage: [] };
  }

}
