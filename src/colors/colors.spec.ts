import { clz, ZColors } from './colors';

describe('ZColors', () => {
  describe('useByDefault', () => {
    it('assigns default theme to use', () => {

      const colors: jest.Mocked<ZColors> = {
        usage: jest.fn(),
        param: jest.fn(),
        sign: jest.fn(),
        optional: jest.fn(),
        bullet: jest.fn(),
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
