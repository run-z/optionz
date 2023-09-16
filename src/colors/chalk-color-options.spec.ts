import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { asArray, asis, noop } from '@proc7ts/primitives';
import type { ColorSupportLevel } from 'chalk';
import chalk from 'chalk';
import { MockedFunction } from 'jest-mock';
import { helpZOptionReader } from '../help/help-option-reader.js';
import { ZOptionError } from '../option-error.js';
import type { ZOption } from '../option.js';
import { SimpleZOptionsParser, simpleZOptionsParser } from '../simple-options-parser.js';
import { SupportedZOptions } from '../supported-options.js';
import { type ChalkZColorConfig } from './chalk-color-config.js';
import { chalkZColorOptions } from './chalk-color-options.js';

describe('chalkZColorOptions', () => {
  let defaultLevel: ColorSupportLevel;

  beforeEach(() => {
    defaultLevel = chalk.level;
  });
  afterEach(() => {
    chalk.level = defaultLevel;
  });

  let parser: SimpleZOptionsParser;

  beforeEach(() => {
    parser = simpleZOptionsParser({
      options: chalkZColorOptions(),
    });
  });

  describe('--color', () => {
    it('enables basic color support', async () => {
      chalk.level = 0;
      await parser(['--color']);
      expect(chalk.level).toBe(1);
    });
    it('enables basic color support by `true` value', async () => {
      chalk.level = 0;
      await parser(['--color=true']);
      expect(chalk.level).toBe(1);
    });
    it('enables basic color support by `always` value', async () => {
      chalk.level = 0;
      await parser(['--color=always']);
      expect(chalk.level).toBe(1);
    });
    it('enables 256 colors support', async () => {
      chalk.level = 0;
      await parser(['--color=256']);
      expect(chalk.level).toBe(2);
    });
    it('enables 16m colors support', async () => {
      chalk.level = 0;
      await parser(['--color=16m']);
      expect(chalk.level).toBe(3);
    });
    it('enables 16m colors support by `full` value', async () => {
      chalk.level = 0;
      await parser(['--color=full']);
      expect(chalk.level).toBe(3);
    });
    it('enables 16m colors support by `truecolor` value', async () => {
      chalk.level = 0;
      await parser(['--color=truecolor']);
      expect(chalk.level).toBe(3);
    });
    it('disables color support by `false` value', async () => {
      chalk.level = 1;
      await parser(['--color=false']);
      expect(chalk.level).toBe(0);
    });
    it('disables color support by `never` value', async () => {
      chalk.level = 1;
      await parser(['--color=never']);
      expect(chalk.level).toBe(0);
    });
    it('ignores unrecognized value', async () => {
      const error = await parser(['--color=wrong!']).catch(asis);

      expect(error).toBeInstanceOf(ZOptionError);
      expect(error.message).toBe('Unrecognized terminal color mode: "wrong!"');
    });
  });

  describe('--no-color', () => {
    it('disables color support', async () => {
      chalk.level = 1;
      await parser(['--no-color']);
      expect(chalk.level).toBe(0);
    });
  });

  describe('--no-colors', () => {
    it('disables color support', async () => {
      chalk.level = 1;
      await parser(['--no-colors']);
      expect(chalk.level).toBe(0);
    });
  });

  it('forces color by custom method', async () => {
    const forceColors = jest.fn<Required<ChalkZColorConfig<ZOption>>['forceColors']>(noop);

    parser = simpleZOptionsParser({
      options: chalkZColorOptions({
        forceColors,
      }),
    });

    await parser(['--color=256']);

    expect(forceColors).toHaveBeenCalledWith(
      { level: 2, hasBasic: true, has256: true, has16m: false },
      expect.anything() as unknown as ZOption,
    );
  });

  it('has help', async () => {
    const options = [
      ...asArray<SupportedZOptions.Map | SupportedZOptions.Provider>(chalkZColorOptions()),
    ];
    const display: MockedFunction<(...args: unknown[]) => void> = jest.fn(noop);

    options.push({
      '-h': helpZOptionReader({ display }),
    });

    parser = simpleZOptionsParser({ options });

    await parser(['-h']);

    expect(display).toHaveBeenCalledWith(
      expect.arrayContaining([
        ['--color', expect.anything()],
        ['--no-color', expect.anything()],
        ['-h', expect.anything()],
      ]),
      expect.anything(),
    );
  });
});
