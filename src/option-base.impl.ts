import type { ZOptionLocation } from './option-location.js';
import type { ZOptionMeta } from './option-meta.js';
import type { ZOptionReader } from './option-reader.js';
import type { ZOptionImpl } from './option.impl.js';
import type { ZOption } from './option.js';

/**
 * @internal
 */
export class ZOptionBase<TOption extends ZOption> implements ZOption {

  readonly #impl: ZOptionImpl<TOption>;

  constructor(impl: ZOptionImpl<TOption>) {
    this.#impl = impl;
  }

  get name(): string {
    return this.#impl.name;
  }

  get key(): string {
    return this.#impl.key;
  }

  get args(): readonly string[] {
    return this.#impl.args;
  }

  get argIndex(): number {
    return this.#impl.argIndex;
  }

  values(max?: number): readonly string[] {
    this.recognize();

    return this.#impl.values(false, max);
  }

  rest(max?: number): readonly string[] {
    this.recognize();

    return this.#impl.values(true, max);
  }

  recognize(action?: (this: void) => void): void {
    return this.#impl.recognize(action);
  }

  defer(whenRecognized?: ZOptionReader.Fn<this>): void {
    this.unrecognize();
    this.#impl.defer(whenRecognized as ZOptionReader.Fn<any>);
  }

  unrecognize(reason?: unknown): void {
    this.#impl.unrecognize(reason);
  }

  whenRecognized(receiver: (this: void, option: this) => void): void {
    this.#impl.whenRecognized(receiver as (option: unknown) => void);
  }

  optionLocation(init?: ZOptionLocation.Init): Required<ZOptionLocation> {
    return this.#impl.optionLocation(init);
  }

  supportedOptions(): readonly string[] {
    return [...this.#impl.optionsMeta().keys()];
  }

  optionMeta(key: string): ZOptionMeta.Combined {
    return this.#impl.optionsMeta().get(key) || { usage: [] };
  }

}
