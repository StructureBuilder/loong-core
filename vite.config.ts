import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';

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
    dts(),
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
