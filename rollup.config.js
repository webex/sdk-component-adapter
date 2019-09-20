import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import builtins from 'rollup-plugin-node-builtins';

const output = (name, format) => ({
  name,
  file: `dist/webexSDKComponentAdapter.${format}.js`,
  format,
  sourcemap: true,
  globals: {
    bufferutil: 'bufferutil',
    'utf-8-validate': 'utf8Validate',
    'spawn-sync': 'spawnSync',
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
      resolve({
        preferBuiltins: true,
      }),
      babel(),
      commonJS(),
      json(),
      builtins(),
    ],
    onwarn(warning, warn) {
      // skip circular dependency warnings from webex library
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;

      // Use default for everything else
      warn(warning);
    },
    external: ['bufferutil', 'utf-8-validate', 'spawn-sync'],
    context: 'null',
  },
];
