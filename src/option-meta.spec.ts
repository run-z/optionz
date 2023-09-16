import { describe, expect, it } from '@jest/globals';
import { noop } from '@proc7ts/primitives';
import type { ZOptionMeta } from './option-meta.js';
import { simpleZOptionsParser } from './simple-options-parser.js';

describe('ZOptionMeta', () => {
  it('is reported to option', async () => {
    let options: string[] | undefined;
    const parser = simpleZOptionsParser({
      options: {
        '--test'(option) {
          option.rest();
        },
        '--help': {
          read(option) {
            options = Array.from(option.supportedOptions());
            option.rest();
          },
        },
      },
    });

    await parser(['--help']);

    expect(options).toEqual(['--test', '--help']);
  });
  it('has default usage info', async () => {
    let help: ZOptionMeta.Combined | undefined;
    const parser = simpleZOptionsParser({
      options: {
        '--help'(option) {
          help = option.optionMeta('--help');
          option.rest();
        },
      },
    });

    await parser(['--help']);

    expect(help).toEqual({ usage: ['--help'] });
  });
  it('is combined from multiple specs', async () => {
    let help: ZOptionMeta.Combined | undefined;
    let test: ZOptionMeta.Combined | undefined;
    const parser = simpleZOptionsParser({
      options: [
        {
          '--help': {
            read(option) {
              help = option.optionMeta('--help');
              test = option.optionMeta('--test');
              option.rest();
            },
            meta: {
              usage: '--help=brief',
              help: 'help!',
            },
          },
          '--test': {
            read: noop,
            meta: {
              description: 'test description!',
            },
          },
        },
        {
          '--help': {
            read: noop,
            meta: {
              usage: '--help=verbose',
              help: 'he-e-elp!',
              description: 'description!',
            },
          },
          '--test': {
            read: noop,
            meta: {
              help: 'test!',
            },
          },
        },
      ],
    });

    await parser(['--help']);

    expect(help).toEqual({
      usage: ['--help=brief', '--help=verbose'],
      help: 'help!',
      description: 'description!',
    });
    expect(test).toEqual({
      usage: ['--test'],
      help: 'test!',
      description: 'test description!',
    });
  });
  it('is combined with aliases', async () => {
    let all: string[] | undefined;
    let help: ZOptionMeta.Combined | undefined;
    const parser = simpleZOptionsParser({
      options: {
        '--help': {
          read(option) {
            all = [...option.supportedOptions()];
            help = option.optionMeta('--help');
            option.rest();
          },
          meta: {
            help: 'help!',
          },
        },
        '-h': {
          read: noop,
          meta: {
            aliasOf: '--help',
          },
        },
      },
    });

    await parser(['--help']);
    expect(all).toEqual(['--help']);
    expect(help).toEqual({
      usage: ['--help', '-h'],
      help: 'help!',
    });
  });
  it('is empty for unsupported option', async () => {
    let help: ZOptionMeta.Combined | undefined;
    const parser = simpleZOptionsParser({
      options: {
        '--help'(option) {
          help = option.optionMeta('--wrong');
          option.rest();
        },
      },
    });

    await parser(['--help']);
    expect(help).toEqual({ usage: [] });
  });
  it('is empty for hidden option', async () => {
    let all: string[] | undefined;
    let help: ZOptionMeta.Combined | undefined;
    const parser = simpleZOptionsParser({
      options: {
        '--help'(option) {
          all = Array.from(option.supportedOptions());
          help = option.optionMeta('--hidden');
          option.rest();
        },
        '--hidden': {
          read: noop,
          meta: {
            hidden: true,
          },
        },
      },
    });

    await parser(['--help']);
    expect(all).toEqual(['--help']);
    expect(help).toEqual({ usage: [] });
  });
});
