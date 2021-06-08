import { externalModules } from '@run-z/rollup-helpers';
import path from 'path';
import { defineConfig } from 'rollup';
import flatDts from 'rollup-plugin-flat-dts';
import sourcemaps from 'rollup-plugin-sourcemaps';
import ts from 'rollup-plugin-typescript2';
import typescript from 'typescript';

export default defineConfig({
  input: {
    optionz: './src/index.ts',
    'optionz.colors': './src/colors/index.ts',
    'optionz.help': './src/help/index.ts',
  },
  plugins: [
    ts({
      typescript,
      tsconfig: 'tsconfig.main.json',
      cacheRoot: 'target/.rts2_cache',
      useTsconfigDeclarationDir: true,
    }),
    sourcemaps(),
  ],
  external: externalModules(),
  manualChunks(id) {
    if (id.startsWith(path.resolve('src', 'colors') + path.sep)) {
      return 'optionz.colors';
    }
    if (id.startsWith(path.resolve('src', 'help') + path.sep)) {
      return 'optionz.help';
    }
    return 'optionz';
  },
  output: {
    format: 'esm',
    sourcemap: true,
    dir: '.',
    entryFileNames: 'dist/[name].js',
    chunkFileNames: 'dist/_[name].js',
    hoistTransitiveImports: false,
    plugins: [
      flatDts({
        tsconfig: 'tsconfig.main.json',
        lib: true,
        compilerOptions: {
          declarationMap: true,
        },
        entries: {
          colors: {
            file: 'colors/index.d.ts',
          },
          help: {
            file: 'help/index.d.ts',
          },
        },
      }),
    ],
  },
});
