import { ZOptionLocation } from './option-location';

describe('ZOptionLocation', () => {
  describe('by', () => {
    it('corrects negative indices', () => {
      expect(ZOptionLocation.by({
        args: ['test'],
        index: -1,
        endIndex: -1,
        offset: -1,
        endOffset: -1,
      })).toEqual({
        args: ['test'],
        index: 0,
        endIndex: 1,
        offset: 0,
        endOffset: 0,
      });
    });
    it('corrects indices after the end of command line', () => {
      expect(ZOptionLocation.by({
        args: ['test'],
        index: 2,
        endIndex: 2,
        offset: 111,
        endOffset: 222,
      })).toEqual({
        args: ['test'],
        index: 1,
        endIndex: 1,
        offset: 0,
        endOffset: 0,
      });
    });
    it('corrects end index before the start one', () => {
      expect(ZOptionLocation.by({
        args: ['first', 'second'],
        index: 1,
        endIndex: 1,
      })).toEqual({
        args: ['first', 'second'],
        index: 1,
        endIndex: 2,
        offset: 0,
        endOffset: 6,
      });
    });
    it('corrects end offset before the start one', () => {
      expect(ZOptionLocation.by({
        args: ['test'],
        index: 0,
        endIndex: 1,
        offset: 2,
        endOffset: 0,
      })).toEqual({
        args: ['test'],
        index: 0,
        endIndex: 1,
        offset: 2,
        endOffset: 2,
      });
    });
  });
});
