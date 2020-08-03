import { ZOptionError } from './option-error';

describe('ZOptionError', () => {
  it('has default message', () => {
    expect(new ZOptionError({ args: ['test'], index: 0 }).message).toBe('Unrecognized command line option');
  });
  it('reconstruct option location', () => {
    expect(new ZOptionError({ args: ['test'], index: 0 }).optionLocation).toEqual({
      args: ['test'],
      index: 0,
      endIndex: 1,
      offset: 0,
      endOffset: 4,
    });
  });
});
