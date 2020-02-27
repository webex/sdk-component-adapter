import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';

const output = (name, format) => ({
  name,
  file: `dist/webexSDKComponentAdapter.${format}.js`,
  format,
  sourcemap: true,
  globals: {
    '@webex/common': '@webex.common',
    rxjs: 'rxjs',
    'rxjs/operators': 'rxjs.operators',
  },
});

export default [
  {
    input: 'src/index.js',
    output: [
      output('webexSDKComponentAdapter', 'cjs'),
      output('UMDWebexSDKComponentAdapter', 'umd'),
      output('ESMWebexSDKComponentAdapter', 'esm'),
    ],
    plugins: [
      resolve(),
      babel({
        runtimeHelpers: true,
      }),
      commonJS(),
    ],
    external: ['@webex/common', 'rxjs', 'rxjs/operators'],
  },
];
