import ts from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import flatDts from 'rollup-plugin-flat-dts';
import unbundle from 'rollup-plugin-unbundle';
import { resolveRootPackage } from 'rollup-plugin-unbundle/api';
import typescript from 'typescript';

const resolutionRoot = resolveRootPackage();

export default defineConfig({
  input: {
    optionz: './src/index.ts',
    'optionz.colors': './src/colors/index.ts',
    'optionz.help': './src/help/index.ts',
  },
  plugins: [
    unbundle({
      resolutionRoot,
    }),
    ts({
      typescript,
      tsconfig: 'tsconfig.main.json',
      cacheDir: 'target/.rts_cache',
    }),
  ],
  output: {
    format: 'esm',
    sourcemap: true,
    dir: '.',
    entryFileNames: 'dist/[name].js',
    chunkFileNames: 'dist/_[name].js',
    manualChunks(id) {
      const module = resolutionRoot.resolveImport(id);
      const host = module.host;

      if (host?.name === '@run-z/optionz') {
        const path = module.uri.slice(host.uri.length + 1);

        if (path.startsWith('src/colors')) {
          return 'optionz.colors';
        }
        if (path.startsWith('src/help')) {
          return 'optionz.help';
        }
      }

      return 'optionz';
    },
    hoistTransitiveImports: false,
    plugins: [
      flatDts({
        tsconfig: 'tsconfig.main.json',
        lib: true,
        file: './dist/optionz.d.ts',
        compilerOptions: {
          declarationMap: true,
        },
        entries: {
          colors: {
            file: './dist/optionz.colors.d.ts',
          },
          help: {
            file: './dist/optionz.help.d.ts',
          },
        },
      }),
    ],
  },
});
