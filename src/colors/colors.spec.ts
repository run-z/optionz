import { describe, expect, it, jest } from '@jest/globals';
import { ZColors, clz } from './colors.js';

describe('ZColors', () => {
  describe('useByDefault', () => {
    it('assigns default theme to use', () => {
      const colors = {
        usage: jest.fn<(...args: unknown[]) => string>(() => ''),
        param: jest.fn<(...args: unknown[]) => string>(() => ''),
        sign: jest.fn<(...args: unknown[]) => string>(() => ''),
        optional: jest.fn<(...args: unknown[]) => string>(() => ''),
        bullet: jest.fn<(...args: unknown[]) => string>(() => ''),
      };

      ZColors.useByDefault(colors);

      clz.usage('test');
      expect(colors.usage).toHaveBeenCalledWith('test');

      clz.param('paramName');
      expect(colors.param).toHaveBeenCalledWith('paramName');

      clz.sign('grammarSign');
      expect(colors.sign).toHaveBeenCalledWith('grammarSign');

      clz.optional('optional grammar');
      expect(colors.optional).toHaveBeenCalledWith('optional grammar');

      clz.bullet('**');
      expect(colors.bullet).toHaveBeenCalledWith('**');
    });
  });
});
