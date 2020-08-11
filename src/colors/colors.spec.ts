import { clz, ZColors } from './colors';

describe('ZColors', () => {
  describe('useByDefault', () => {
    it('assigns default theme to use', () => {

      const colors: jest.Mocked<ZColors> = {
        usage: jest.fn(),
      };

      ZColors.useByDefault(colors);

      clz.usage('test');
      expect(colors.usage).toHaveBeenCalledWith('test');
    });
  });
});
