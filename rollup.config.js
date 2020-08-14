import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';

const output = (name, format) => ({
  name,
  file: `dist/webexSDKComponentAdapter.${format}.js`,
  format,
  sourcemap: true,
  globals: {
    rxjs: 'rxjs',
    'rxjs/operators': 'rxjs.operators',
    webex: 'webex',
  },
});

export default [
  {
    input: 'src/index.js',
    output: [output('ESMWebexSDKComponentAdapter', 'esm')],
    plugins: [
      resolve({preferBuiltins: false}),
      babel({
        runtimeHelpers: true,
      }),
      commonJS({
        namedExports: {
          '@webex/common': ['deconstructHydraId'],
        },
      }),
    ],
    external: ['rxjs', 'rxjs/operators', 'webex'],
  },
];
