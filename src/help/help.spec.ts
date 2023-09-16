import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { noop } from '@proc7ts/primitives';
import type { MockedFunction, SpiedFunction } from 'jest-mock';
import { simpleZOptionsParser } from '../simple-options-parser.js';
import { helpZOptionReader } from './help-option-reader.js';

describe('helpZOptionReader', () => {
  let logSpy: SpiedFunction<(...args: unknown[]) => void>;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log');
    logSpy.mockImplementation(noop);
  });
  afterEach(() => {
    logSpy.mockRestore();
  });

  it('prints detailed options help', async () => {
    const parser = simpleZOptionsParser({
      options: {
        '--test': {
          read: noop,
          meta: {
            help: 'TEST HELP',
            description: 'TEST DESCRIPTION',
          },
        },
        '--help': helpZOptionReader(),
      },
    });

    await parser(['--help']);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('--help'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('--test'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('TEST HELP'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('TEST DESCRIPTION'));
  });
  it('prints brief options help', async () => {
    const parser = simpleZOptionsParser({
      options: {
        '--test': {
          read: noop,
          meta: {
            help: 'TEST HELP',
            description: 'TEST DESCRIPTION',
          },
        },
        '--help': helpZOptionReader({ mode: 'brief' }),
      },
    });

    await parser(['--help']);

    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('--help'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('--test'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('TEST HELP'));
    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('TEST DESCRIPTION'));
  });
  it('displays help with the given method', async () => {
    const display: MockedFunction<(...args: unknown[]) => void> = jest.fn(noop);
    const parser = simpleZOptionsParser({
      options: {
        '--test': noop,
        '--help': helpZOptionReader({
          display,
        }),
      },
    });

    await parser(['--help']);

    expect(display).toHaveBeenCalledWith(
      [
        ['--help', { usage: ['--help'] }],
        ['--test', { usage: ['--test'] }],
      ],
      expect.anything(),
    );
    expect(logSpy).not.toHaveBeenCalled();
  });
  it('compares options by group first', async () => {
    const display: MockedFunction<(...args: unknown[]) => void> = jest.fn(noop);
    const parser = simpleZOptionsParser({
      options: {
        '--test': {
          read: noop,
          meta: {
            group: '1',
          },
        },
        '--help': {
          read: helpZOptionReader({
            display,
          }),
        },
        '--abc': {
          read: noop,
          meta: {
            group: '1',
          },
        },
      },
    });

    await parser(['--help']);

    expect(display).toHaveBeenCalledWith(
      [
        ['--abc', { usage: ['--abc'], group: '1' }],
        ['--test', { usage: ['--test'], group: '1' }],
        ['--help', { usage: ['--help'] }],
      ],
      expect.anything(),
    );
  });
  it('compares options by group and key', async () => {
    const display: MockedFunction<(...args: unknown[]) => void> = jest.fn(noop);
    const parser = simpleZOptionsParser({
      options: {
        '--test': {
          read: noop,
          meta: {
            group: '1',
          },
        },
        '--help': {
          read: helpZOptionReader({
            display,
          }),
          meta: {
            group: '1',
          },
        },
        '--abc': {
          read: noop,
          meta: {
            group: '2',
          },
        },
      },
    });

    await parser(['--help']);

    expect(display).toHaveBeenCalledWith(
      [
        ['--help', { usage: ['--help'], group: '1' }],
        ['--test', { usage: ['--test'], group: '1' }],
        ['--abc', { usage: ['--abc'], group: '2' }],
      ],
      expect.anything(),
    );
  });
  it('compares options by custom method', async () => {
    const display: MockedFunction<(...args: unknown[]) => void> = jest.fn(noop);
    const parser = simpleZOptionsParser({
      options: {
        '--test-option': noop,
        '--help': helpZOptionReader({
          display,
          compare(key1, _meta1, key2) {
            return key1.length - key2.length;
          },
        }),
        '--abc': noop,
      },
    });

    await parser(['--help']);

    expect(display).toHaveBeenCalledWith(
      [
        ['--abc', { usage: ['--abc'] }],
        ['--help', { usage: ['--help'] }],
        ['--test-option', { usage: ['--test-option'] }],
      ],
      expect.anything(),
    );
  });
});
