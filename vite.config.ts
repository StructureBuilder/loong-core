import { defineConfig } from 'vite';
import { resolve } from 'path';
import path from 'path';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';

const typeFiles: string[] = ['core/types/index.d.ts', 'react-pure/types/index.d.ts'];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          'babel-plugin-transform-typescript-metadata',
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          ['@babel/plugin-proposal-class-properties', { loose: true }],
        ],
      },
    }),
    tsconfigPaths(),
    dts({
      beforeWriteFile(filePath, content) {
        if (typeFiles.some((typeFile) => filePath.includes(typeFile))) {
          return;
        }
        return {
          filePath,
          content: `${typeFiles
            .map((typeFile) => {
              const result = path
                .relative(filePath, path.join(__dirname, 'dist/src/', typeFile))
                .slice(3);
              if (!result) {
                return null;
              }
              return `/// <reference path="${result}" />`;
            })
            .filter(Boolean)
            .join('\n')}\n${content}`,
        };
      },
    }),
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LoongCore',
      fileName: (format) => `loong-core.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'mobx', 'mobx-react-lite'],
      output: {
        globals: {
          react: 'React',
          mobx: 'Mobx',
          'mobx-react-lite': 'MobxReactLite',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
