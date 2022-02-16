import {babel} from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

const output = (name, format) => ({
  name,
  file: `dist/webexSDKComponentAdapter.${format}.js`,
  format,
  sourcemap: true,
  globals: {
    rxjs: 'rxjs',
    'rxjs/operators': 'rxjs.operators',
    webex: 'webex',
    winston: 'winston',
    'winston-transport': 'winston-transport',
    '@webex/common': '@webex/common',
  },
});

export default [
  {
    input: 'src/index.js',
    output: [output('ESMWebexSDKComponentAdapter', 'esm')],
    plugins: [
      globals(),
      builtins(),
      json(),
      resolve({preferBuiltins: false}),
      commonJS({
        transformMixedEsModules: true,
      }),
      babel({
        babelHelpers: 'runtime',
        plugins: ['@babel/plugin-transform-runtime'],
      }),
    ],
    external: ['rxjs', 'rxjs/operators', 'webex', '@webex/common', 'winston'],
  },
];
