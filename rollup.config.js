import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';
import del from 'rollup-plugin-delete';

const dist = './dist';
const name = 'monomove';

const plugins = [
	commonjs(),
	typescript(),
	terser({
		ecma: 2020,
		module: true,
		toplevel: true,
		compress: {
			// drop_console: true,
			drop_debugger: true,
			passes: 3,
			pure_getters: true,
			unsafe: true,
			unsafe_arrows: true,
			unsafe_math: true,
			pure_funcs: ['console.info', 'console.debug', 'console.warn']
		},
		mangle: {
			toplevel: true,
			properties: {
				regex: /^_/,
				reserved: ['__proto__', 'prototype'],
				keep_quoted: true
			}
		},
		format: {
			// comments: false,
			quote_style: 1,
			wrap_func_args: false
		}
	})
];

const umdVirtualEntry = () => ({
	name: 'virtual-umd-entry',
	resolveId(id) {
		if (id === 'virtual-umd-entry') return id;
	},
	load(id) {
		if (id === 'virtual-umd-entry') {
			return `export * from './src/index.ts'; import './src/easings.ts';`;
		}
	}
});

export default [
	// 1. ESM and CJS (Code Split)
	// index.js will NOT include easings. easings.js is separate.
	{
		input: {
			index: './src/index.ts',
			easings: './src/easings.ts'
		},
		output: [
			{
				dir: dist,
				format: 'cjs',
				entryFileNames: '[name].cjs',
				chunkFileNames: 'chunks/[name].cjs',
				esModule: true
			},
			{
				dir: dist,
				format: 'esm',
				entryFileNames: '[name].mjs',
				chunkFileNames: 'chunks/[name].mjs'
			}
		],
		plugins: [
			del({ targets: `${dist}/*`, runOnce: true }),
			...plugins,
		]
	},

	// 2. UMD (Bundled All-in-One)
	// Includes core + easings
	{
		input: 'virtual-umd-entry', // Uses our helper plugin above
		output: {
			file: `${dist}/index.umd.js`,
			format: 'umd',
			name,
			esModule: true,
			// Since we use a virtual entry, we map the export back to the package name
			extend: true
		},
		plugins: [umdVirtualEntry(), ...plugins]
	},

	// 3. Type Definitions
	{
		input: {
			index: './src/index.ts',
			easings: './src/easings.ts'
		},
		output: {
			dir: dist,
			format: 'esm',
			entryFileNames: '[name].d.ts'
		},
		plugins: [typescript(), dts()]
	}
];
