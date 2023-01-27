import { configureJest } from '@run-z/project-config';

export default await configureJest({
  moduleNameMapper: {
    // Subpath imports not supported by Jest
    // See https://github.com/facebook/jest/issues/11100
    '^#ansi-styles$': 'ansi-styles',
    '^#supports-color$': 'supports-color',
  },
});
