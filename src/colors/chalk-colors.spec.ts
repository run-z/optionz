import { beforeEach, describe, expect, it } from '@jest/globals';
import stripAnsi from 'strip-ansi';
import { ChalkZColors } from './chalk-colors';

describe('ChalkZColors', () => {

  let colors: ChalkZColors;

  beforeEach(() => {
    colors = new ChalkZColors();
  });

  describe('usage', () => {
    it('formats usage', () => {
      expect(stripAnsi(colors.usage('usage example'))).toBe('usage example');
    });
  });

  describe('param', () => {
    it('formats parameter', () => {
      expect(stripAnsi(colors.param('PARAM'))).toBe('\u276cPARAM\u276d');
    });
  });

  describe('sign', () => {
    it('formats grammar sign', () => {
      expect(stripAnsi(colors.sign('SIGN'))).toBe('SIGN');
    });
  });

  describe('optional', () => {
    it('formats optional grammar', () => {
      expect(stripAnsi(colors.optional('optional grammar'))).toBe('[optional grammar]');
    });
  });

  describe('bullet', () => {
    it('formats bullet', () => {
      expect(stripAnsi(colors.bullet())).toBe('  \u2023');
      expect(stripAnsi(colors.bullet('-'))).toBe('  -');
    });
  });

});
