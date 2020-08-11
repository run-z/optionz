// eslint-disable-next-line @typescript-eslint/no-var-requires
import { arrayOfElements, asis } from '@proc7ts/primitives';
import type { ColorSupport } from 'chalk';
import { helpZOptionReader } from '../help';
import { ZOptionError } from '../option-error';
import { simpleZOptionsParser, SimpleZOptionsParser } from '../simple-options-parser';
import { chalkZColorOptions } from './chalk-color-options';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chalk = require('chalk');

describe('chalkZColorOptions', () => {

  let defaultLevel: ColorSupport | false;

  beforeEach(() => {
    defaultLevel = chalk.supportsColor;
  });
  afterEach(() => {
    chalk.supportsColor = defaultLevel;
  });

  let parser: SimpleZOptionsParser;

  beforeEach(() => {
    parser = simpleZOptionsParser({
      options: chalkZColorOptions(),
    });
  });

  describe('--color', () => {
    it('enables basic color support', async () => {
      chalk.supportsColor = { level: 0 };
      await parser(['--color']);
      expect(chalk.supportsColor.level).toBe(1);
    });
    it('enables basic color support by `true` value', async () => {
      chalk.supportsColor = { level: 0 };
      await parser(['--color=true']);
      expect(chalk.supportsColor.level).toBe(1);
    });
    it('enables basic color support by `always` value', async () => {
      chalk.supportsColor = { level: 0 };
      await parser(['--color=always']);
      expect(chalk.supportsColor.level).toBe(1);
    });
    it('enables 256 colors support', async () => {
      chalk.supportsColor = { level: 0 };
      await parser(['--color=256']);
      expect(chalk.supportsColor.level).toBe(2);
    });
    it('enables 16m colors support', async () => {
      chalk.supportsColor = { level: 0 };
      await parser(['--color=16m']);
      expect(chalk.supportsColor.level).toBe(3);
    });
    it('enables 16m colors support by `full` value', async () => {
      chalk.supportsColor = { level: 0 };
      await parser(['--color=full']);
      expect(chalk.supportsColor.level).toBe(3);
    });
    it('enables 16m colors support by `truecolor` value', async () => {
      chalk.supportsColor = { level: 0 };
      await parser(['--color=truecolor']);
      expect(chalk.supportsColor.level).toBe(3);
    });
    it('disables color support by `false` value', async () => {
      chalk.supportsColor = { level: 1 };
      await parser(['--color=false']);
      expect(chalk.supportsColor).toBe(false);
    });
    it('disables color support by `never` value', async () => {
      chalk.supportsColor = { level: 1 };
      await parser(['--color=never']);
      expect(chalk.supportsColor).toBe(false);
    });
    it('ignores unrecognized value', async () => {

      const error = await parser(['--color=wrong!']).catch(asis);

      expect(error).toBeInstanceOf(ZOptionError);
      expect(error.message).toBe('Unrecognized terminal color mode: "wrong!"');
    });
  });

  describe('--no-color', () => {
    it('disables color support', async () => {
      chalk.supportsColor = { level: 1 };
      await parser(['--no-color']);
      expect(chalk.supportsColor).toBe(false);
    });
  });

  describe('--no-colors', () => {
    it('disables color support', async () => {
      chalk.supportsColor = { level: 1 };
      await parser(['--no-colors']);
      expect(chalk.supportsColor).toBe(false);
    });
  });

  it('forces color by custom method', async () => {

    const forceColors = jest.fn();

    parser = simpleZOptionsParser({
      options: chalkZColorOptions({
        forceColors,
      }),
    });

    await parser(['--color=256']);

    expect(forceColors).toHaveBeenCalledWith(
        { level: 2, hasBasic: true, has256: true, has16m: false },
        expect.anything(),
    );
  });

  it('has help', async () => {

    const options = [...arrayOfElements(chalkZColorOptions())];
    const display = jest.fn();

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
