import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { asis, noop, valueProvider } from '@proc7ts/primitives';
import type { Mock } from 'jest-mock';
import { ZOptionError } from './option-error.js';
import type { ZOptionLocation } from './option-location.js';
import type { ZOptionReader } from './option-reader.js';
import { ZOptionSyntax } from './option-syntax.js';
import { SimpleZOptionsParser, simpleZOptionsParser } from './simple-options-parser.js';
import type { SupportedZOptions } from './supported-options.js';

describe('ZOptionsParser', () => {
  it('recognizes option without values', async () => {
    let values: readonly string[] | undefined;

    const parser = simpleZOptionsParser({
      options: {
        '--test': option => {
          values = option.values();
        },
      },
    });

    const recognized = await parser(['--test']);

    expect(values).toHaveLength(0);
    expect(recognized).toEqual({
      '--test': [],
    });
  });
  it('recognizes option with value', async () => {
    let values: readonly string[] | undefined;

    const parser = simpleZOptionsParser({
      options: {
        '--test': option => {
          values = option.values();
        },
      },
    });

    const recognized = await parser(['--test', 'val']);

    expect(values).toEqual(['val']);
    expect(recognized).toEqual({
      '--test': ['val'],
    });
  });
  it('recognizes option with multiple values', async () => {
    let values: readonly string[] | undefined;
    let rest: readonly string[] | undefined;
    let endArgs: readonly string[] | undefined;
    let endIndex: number | undefined;
    const parser = simpleZOptionsParser({
      options: {
        '--test': option => {
          rest = option.rest();
          values = option.values();
        },
        '--end': option => {
          option.rest();
          endArgs = option.args;
          endIndex = option.argIndex;
        },
      },
    });

    const recognized = await parser(['--test', 'val1', 'val2', '--end', '--after-end']);

    expect(values).toEqual(['val1', 'val2']);
    expect(rest).toEqual(['val1', 'val2', '--end', '--after-end']);
    expect(recognized).toEqual({
      '--test': ['val1', 'val2'],
      '--end': ['--after-end'],
    });
    expect(endArgs).toEqual(['--test', 'val1', 'val2', '--end', '--after-end']);
    expect(endIndex).toBe(3);
  });
  it('recognizes option with up to the max values', async () => {
    let values: readonly string[] | undefined;
    let rest: readonly string[] | undefined;
    const parser = simpleZOptionsParser({
      options: {
        '--test': option => {
          rest = option.rest();
          values = option.values(13);
        },
        '--end': option => {
          option.rest();
        },
      },
    });

    const recognized = await parser(['--test', 'val1', 'val2', '--end']);

    expect(values).toEqual(['val1', 'val2']);
    expect(rest).toEqual(['val1', 'val2', '--end']);
    expect(recognized).toEqual({
      '--test': ['val1', 'val2'],
      '--end': [],
    });
  });
  it('recognizes option with negative max values', async () => {
    let values: readonly string[] | undefined;
    let rest: readonly string[] | undefined;
    let restLocation: ZOptionLocation | undefined;
    const parser = simpleZOptionsParser({
      options: {
        '--test': option => {
          values = option.values(-1);
        },
        '*': option => {
          rest = option.rest();
          restLocation = option.optionLocation({ endIndex: option.args.length });
        },
      },
    });

    const recognized = await parser(['--test', 'val1', 'val2', '--end']);

    expect(values).toEqual([]);
    expect(rest).toEqual(['val2', '--end']);
    expect(restLocation).toEqual({
      args: ['--test', 'val1', 'val2', '--end'],
      index: 1,
      endIndex: 4,
      offset: 0,
      endOffset: 5,
    });
    expect(recognized).toEqual({
      '--test': [],
      val1: ['val2', '--end'],
    });
  });
  it('recognizes option with up to the max of rest values', async () => {
    let values: readonly string[] | undefined;
    const parser = simpleZOptionsParser({
      options: {
        '--test': option => {
          values = option.rest(2);
        },
        '*': option => {
          option.values(0);
        },
      },
    });

    const recognized = await parser(['--test', 'val1', 'val2', 'end', 'other']);

    expect(values).toEqual(['val1', 'val2']);
    expect(recognized).toEqual({
      '--test': ['val1', 'val2'],
      end: [],
      other: [],
    });
  });
  it('throws on unrecognized option', async () => {
    const parser = simpleZOptionsParser({ options: {} });
    const error = await parser(['--option']).catch(asis);

    expect(error).toBeInstanceOf(ZOptionError);
    expect(error.optionLocation).toEqual({
      args: ['--option'],
      index: 0,
      endIndex: 1,
      offset: 0,
      endOffset: 8,
    });
  });
  it('accepts supported options provider', async () => {
    let values: readonly string[] | undefined;

    const parser = simpleZOptionsParser({
      options: valueProvider({
        '--test': option => {
          values = option.values();
        },
      }),
    });

    const recognized = await parser(['--test', 'val']);

    expect(values).toEqual(['val']);
    expect(recognized).toEqual({
      '--test': ['val'],
    });
  });
  it('ignores undefined option reader', async () => {
    let values: readonly string[] | undefined;

    const parser = simpleZOptionsParser({
      options: [
        {
          '--test': option => {
            values = option.values();
          },
        },
        {
          '--test': undefined,
        },
      ],
    });

    const recognized = await parser(['--test', 'val']);

    expect(values).toEqual(['val']);
    expect(recognized).toEqual({
      '--test': ['val'],
    });
  });
  it('defers option recognition', async () => {
    let deferred: readonly string[] | undefined;
    let restDeferred: readonly string[] | undefined;
    let values: readonly string[] | undefined;
    const parser = simpleZOptionsParser({
      options: [
        {
          '--test': option => {
            option.defer(d => {
              deferred = d.values();
              restDeferred = d.rest();
            });
          },
        },
        {
          '--test': option => {
            values = option.values(1);
          },
          end: option => {
            option.rest();
          },
        },
      ],
    });

    const recognized = await parser(['--test', 'val', 'end']);

    expect(values).toEqual(['val']);
    expect(deferred).toEqual(['val']);
    expect(restDeferred).toEqual(['val']);
    expect(recognized).toEqual({
      '--test': ['val'],
      end: [],
    });
  });
  it('accepts already recognized option', async () => {
    let values: readonly string[] | undefined;
    let deferred: readonly string[] | undefined;
    let restDeferred: readonly string[] | undefined;
    let accepted: readonly string[] | undefined;
    const parser = simpleZOptionsParser({
      options: [
        {
          '--test': option => {
            values = option.values(1);
          },
          end: option => {
            option.rest();
          },
        },
        {
          '--test': option => {
            accepted = option.values();
            option.defer(d => {
              deferred = d.values();
              restDeferred = d.rest();
            });
          },
        },
      ],
    });

    const recognized = await parser(['--test', 'val', 'end']);

    expect(values).toEqual(['val']);
    expect(accepted).toEqual(['val']);
    expect(deferred).toEqual(['val']);
    expect(restDeferred).toEqual(['val']);
    expect(recognized).toEqual({
      '--test': ['val'],
      end: [],
    });
  });
  it('defers the rest-valued option recognition', async () => {
    let firstDeferred: readonly string[] | undefined;
    let allDeferred: readonly string[] | undefined;
    let values: readonly string[] | undefined;
    const parser = simpleZOptionsParser({
      options: [
        {
          '--test': option => {
            option.defer(d => {
              allDeferred = d.values();
              firstDeferred = d.values(1);
            });
          },
        },
        {
          '--test': option => {
            values = option.rest();
          },
          end: noop,
        },
      ],
    });

    const recognized = await parser(['--test', 'val', 'end']);

    expect(values).toEqual(['val', 'end']);
    expect(firstDeferred).toEqual(['val']);
    expect(allDeferred).toEqual(['val', 'end']);
    expect(recognized).toEqual({
      '--test': ['val', 'end'],
    });
  });
  it('performs recognition actions', async () => {
    const action1 = jest.fn();
    const action2 = jest.fn();
    const action3 = jest.fn();
    const parser = simpleZOptionsParser({
      options: [
        {
          '--test': option => {
            option.recognize(action1);
            option.defer();
            option.recognize(action2);
            option.values();
            option.recognize(action3);
          },
        },
      ],
    });

    const recognized = await parser(['--test', 'val', 'end']);

    expect(recognized).toEqual({
      '--test': ['val', 'end'],
    });
    expect(action1).not.toHaveBeenCalled();
    expect(action2).toHaveBeenCalledTimes(1);
    expect(action3).toHaveBeenCalledTimes(1);
  });
  it('performs recognition actions when recognized by other reader', async () => {
    const action = jest.fn();
    const parser = simpleZOptionsParser({
      options: [
        {
          '--test': option => {
            option.defer(opt => opt.recognize(action));
          },
        },
        {
          '--test': option => {
            option.defer();
            option.values();
          },
        },
      ],
    });

    const recognized = await parser(['--test', 'val', 'end']);

    expect(recognized).toEqual({
      '--test': ['val', 'end'],
    });
    expect(action).toHaveBeenCalledTimes(1);
  });
  it('throws when option recognition deferred, but not complete', async () => {
    const parser = simpleZOptionsParser({
      options: {
        '--test': option => {
          option.defer(noop);
        },
      },
    });
    const error = await parser(['--test']).catch(asis);

    expect(error).toBeInstanceOf(ZOptionError);
    expect(error.optionLocation).toEqual({
      args: ['--test'],
      index: 0,
      endIndex: 1,
      offset: 0,
      endOffset: 6,
    });
  });
  it('throws when option reader does nothing', async () => {
    const parser = simpleZOptionsParser({
      options: {
        '--test': noop,
      },
    });
    const error = await parser(['--test']).catch(asis);

    expect(error).toBeInstanceOf(ZOptionError);
    expect(error.optionLocation).toEqual({
      args: ['--test'],
      index: 0,
      endIndex: 1,
      offset: 0,
      endOffset: 6,
    });
  });
  it('throws when unrecognized', async () => {
    const parser = simpleZOptionsParser({
      options: {
        '--test': option => {
          option.unrecognize();
        },
      },
    });

    const error = await parser(['--test']).catch(asis);

    expect(error).toBeInstanceOf(ZOptionError);
    expect(error.optionLocation).toEqual({
      args: ['--test'],
      index: 0,
      endIndex: 1,
      offset: 0,
      endOffset: 6,
    });
  });
  it('throws when unrecognized with reason', async () => {
    const reason1 = new Error('reason1');
    const reason2 = new Error('reason2');
    const parser = simpleZOptionsParser({
      options: {
        '--test': option => {
          option.unrecognize(reason1);
          option.unrecognize(reason2);
          option.defer();
        },
      },
    });

    const error = await parser(['--test']).catch(asis);

    expect(error).toBe(reason2);
  });
  it('throws first unrecognized reason', async () => {
    const reason1 = new Error('reason1');
    const reason2 = new Error('reason2');
    const parser = simpleZOptionsParser({
      options: [
        {
          '--test': option => {
            option.unrecognize(reason1);
          },
        },
        {
          '--test': option => {
            option.unrecognize(reason2);
          },
        },
      ],
    });

    const error = await parser(['--test']).catch(asis);

    expect(error).toBe(reason1);
  });
  it('does not throw when option reader does nothing before option recognition', async () => {
    const parser = simpleZOptionsParser({
      options: [
        {
          '--test': noop,
        },
        {
          '--test': option => {
            option.rest();
          },
        },
      ],
    });

    const recognized = await parser(['--test', '1', '2']);

    expect(recognized).toEqual({
      '--test': ['1', '2'],
    });
  });
  it('does not throw when option reader does nothing after option recognition', async () => {
    const parser = simpleZOptionsParser({
      options: [
        {
          '--test': option => {
            option.rest();
          },
        },
        {
          '--test': noop,
        },
      ],
    });

    const recognized = await parser(['--test', '1', '2']);

    expect(recognized).toEqual({
      '--test': ['1', '2'],
    });
  });

  describe('syntax', () => {
    it('retries replacement processing', async () => {
      const parser = simpleZOptionsParser({
        options: [
          {
            '--test': option => {
              option.rest();
            },
            '--*': option => {
              option.values();
            },
          },
        ],
        syntax: [
          ([name]) => (name === '--test' ? [{ name: '--replaced', retry: true }] : []),
          ZOptionSyntax.longOptions,
        ],
      });

      const recognized = await parser(['--test', '1', '2']);

      expect(recognized).toEqual({
        '--replaced': [],
      });
    });
    it('retries replacement args processing', async () => {
      const parser = simpleZOptionsParser({
        options: [
          {
            '--test': option => {
              option.rest();
            },
            '--*': option => {
              option.values();
            },
          },
        ],
        syntax: [
          ([name]) => name === '--test'
              ? [{ name: '--replaced', values: ['r'], tail: ['t'], retry: true }]
              : [],
          ZOptionSyntax.longOptions,
        ],
      });

      const recognized = await parser(['--test', '1', '2']);

      expect(recognized).toEqual({
        '--replaced': ['r', 't'],
      });
    });
    it('prevents processing retry after option recognition', async () => {
      const parser = simpleZOptionsParser({
        options: [
          {
            '--test': option => {
              option.rest();
            },
            '--*': option => {
              option.rest();
            },
          },
        ],
        syntax: [ZOptionSyntax.longOptions, () => [{ name: '--replaced', retry: true }]],
      });

      const recognized = await parser(['--test', '1', '2']);

      expect(recognized).toEqual({
        '--test': ['1', '2'],
      });
    });
  });

  describe('fallback reader', () => {
    let readShort: Mock<ZOptionReader.Fn>;
    let defaultShort: string | undefined;

    let readLong: Mock<ZOptionReader.Fn>;
    let defaultLong: string | undefined;

    let readPositional: Mock<ZOptionReader.Fn>;
    let defaultPositional: string | undefined;

    let fallbackKey: string | undefined;

    function newParser(options: SupportedZOptions.Map = {}): SimpleZOptionsParser {
      return simpleZOptionsParser({
        options: {
          ...options,
          '--*': readLong,
          '-*': readShort,
          '*': readPositional,
        },
      });
    }

    beforeEach(() => {
      readLong = jest.fn(option => {
        defaultLong = option.name;
        fallbackKey = option.key;
        option.values();
      });
      defaultLong = undefined;

      readShort = jest.fn(option => {
        defaultShort = option.name;
        fallbackKey = option.key;
        option.values();
      });
      defaultShort = undefined;

      readPositional = jest.fn(option => {
        defaultPositional = option.name;
        fallbackKey = option.key;
        option.values();
      });
      defaultPositional = undefined;

      fallbackKey = undefined;
    });

    it('reads unrecognized long option with fallback reader', async () => {
      const parser = newParser();

      await parser(['--test']);

      expect(fallbackKey).toBe('--*');

      expect(readLong).toHaveBeenCalledTimes(1);
      expect(defaultLong).toBe('--test');

      expect(readShort).not.toHaveBeenCalled();

      expect(readPositional).not.toHaveBeenCalled();
      expect(defaultPositional).toBeUndefined();
    });
    it('reads unrecognized short option with fallback reader', async () => {
      const parser = newParser();

      await parser(['-t']);

      expect(fallbackKey).toBe('-*');

      expect(readShort).toHaveBeenCalledTimes(1);
      expect(defaultShort).toBe('-t');

      expect(readLong).not.toHaveBeenCalled();

      expect(readPositional).not.toHaveBeenCalled();
      expect(defaultPositional).toBeUndefined();
    });
    it('reads unrecognized positional option with fallback reader', async () => {
      const parser = newParser();

      await parser(['test']);

      expect(fallbackKey).toBe('*');

      expect(readShort).not.toHaveBeenCalled();

      expect(readLong).not.toHaveBeenCalled();
      expect(defaultLong).toBeUndefined();

      expect(readPositional).toHaveBeenCalledTimes(1);
      expect(defaultPositional).toBe('test');
    });
    it('reads unrecognized long option with positional fallback reader if long one defers', async () => {
      readLong.mockImplementation(option => {
        option.defer(({ name }) => {
          defaultLong = name;
        });
      });

      const parser = newParser();

      await parser(['--test']);

      expect(fallbackKey).toBe('*');

      expect(readShort).not.toHaveBeenCalled();

      expect(readLong).toHaveBeenCalledTimes(1);
      expect(defaultLong).toBe('--test');

      expect(readPositional).toHaveBeenCalledTimes(1);
      expect(defaultPositional).toBe('--test');
    });
    it('does not fallback if option read', async () => {
      let recognizedName: string | undefined;
      const parser = newParser({
        '--test': option => {
          option.rest();
          recognizedName = option.name;
        },
      });

      await parser(['--test']);

      expect(fallbackKey).toBeUndefined();
      expect(recognizedName).toBe('--test');
      expect(defaultShort).toBeUndefined();
      expect(defaultLong).toBeUndefined();
      expect(defaultPositional).toBeUndefined();
    });
  });

  describe('long option', () => {
    it('recognizes `--name=value` format', async () => {
      const parser = simpleZOptionsParser({
        options: {
          '--test'(option) {
            option.values();
          },
          '*'(option) {
            option.rest();
          },
        },
        syntax: [ZOptionSyntax.longOptions, ZOptionSyntax.any],
      });

      const recognized = await parser(['--test=value', 'rest']);

      expect(recognized).toEqual({
        '--test': ['value'],
        rest: [],
      });
    });
    it('prefers `--*=*` fallback', async () => {
      const parser = simpleZOptionsParser({
        options: {
          '--*=*'(option) {
            option.values();
          },
          '--*'(option) {
            option.rest();
          },
          '*'(option) {
            option.values(0);
          },
        },
        syntax: [ZOptionSyntax.longOptions, ZOptionSyntax.any],
      });

      const recognized = await parser(['--test=value', 'rest']);

      expect(recognized).toEqual({
        '--test': ['value'],
        rest: [],
      });
    });
  });

  describe('short option', () => {
    it('recognizes one-letter option without parameter', async () => {
      const parser = simpleZOptionsParser({
        options: {
          '-t'(option) {
            option.values();
          },
          '*'(option) {
            option.rest();
          },
        },
        syntax: [ZOptionSyntax.shortOptions, ZOptionSyntax.any],
      });

      const recognized = await parser(['-test']);

      expect(recognized).toEqual({
        '-t': [],
        '-est': [],
      });
    });
    it('prefers one-letter option with parameter', async () => {
      const parser = simpleZOptionsParser({
        options: {
          '-t'(option) {
            option.values();
          },
          '-t*'(option) {
            option.values();
          },
        },
      });

      const recognized = await parser(['-test']);

      expect(recognized).toEqual({
        '-t': ['est'],
      });
    });
    it('recognizes one-letter flags following each other', async () => {
      const parser = simpleZOptionsParser({
        options: {
          '-m'(option) {
            option.values();
          },
          '-n'(option) {
            option.values();
          },
          '-t'(option) {
            option.values();
          },
        },
      });

      const recognized = await parser(['-mnt', 'VALUE']);

      expect(recognized).toEqual({
        '-m': [],
        '-n': [],
        '-t': ['VALUE'],
      });
    });
    it('prefers one-letter fallback', async () => {
      const parser = simpleZOptionsParser({
        options: {
          '-?'(option) {
            option.values();
          },
          '-*'(option) {
            option.values();
          },
        },
      });

      const recognized = await parser(['-test', 'some']);

      expect(recognized).toEqual({
        '-t': ['some'],
        '-e': [],
        '-s': [],
      });
    });
    it('prefers multi-letter option with parameter', async () => {
      const parser = simpleZOptionsParser({
        options: {
          '-t*'(option) {
            option.values();
          },
          '-t'(option) {
            option.values();
          },
          '-test'(option) {
            option.values();
          },
        },
      });

      const recognized = await parser(['-test', 'some']);

      expect(recognized).toEqual({
        '-test': ['some'],
      });
    });
    it('recognizes `-name=VALUE` format', async () => {
      const parser = simpleZOptionsParser({
        options: {
          '-test'(option) {
            option.values();
          },
        },
      });

      const recognized = await parser(['-test=some']);

      expect(recognized).toEqual({
        '-test': ['some'],
      });
    });
    it('falls back to `-?` key for `-n=VALUE` format', async () => {
      const parser = simpleZOptionsParser({
        options: {
          '-?'(option) {
            option.values();
          },
          '-*'(option) {
            option.values(0);
          },
        },
      });

      const recognized = await parser(['-t=some']);

      expect(recognized).toEqual({
        '-t': ['some'],
      });
    });
    it('prefers `-*=*` fallback', async () => {
      const parser = simpleZOptionsParser({
        options: {
          '-*=*'(option) {
            option.values();
          },
          '-?'(option) {
            option.values(0);
          },
          '-*'(option) {
            option.values(0);
          },
        },
      });

      const recognized = await parser(['-t=some']);

      expect(recognized).toEqual({
        '-t': ['some'],
      });
    });
  });
});
