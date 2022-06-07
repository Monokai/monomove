import TerserPlugin from 'terser-webpack-plugin';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = __dirname;

const babelPresets = [
	[
		'@babel/preset-env',
		{
			'useBuiltIns': 'usage',
			'corejs': 3,
			'debug': true
		}
	]
];

const config = {
	entry: {
		'monomove': {
			import: './src/index.js'
		}
	},
	output: {
		path : path.resolve(__dirname, 'dist'),
	},
	resolve: {
		modules: [
			path.join(ROOT, 'src'),
			path.join(ROOT, 'node_modules')
		],
		extensions: ['.js']
	},
	optimization: {
		minimizer: [new TerserPlugin({
			parallel     : true,
			terserOptions: {
				compress: {
					drop_console: true,
					passes: 2
				}
			}
		})]
	},
	module: {
		rules: [
			{
				test   : /\.js$/,
				loader : 'babel-loader',
				exclude: /node_modules/,
				options: {
					presets: babelPresets
				}
			}
		]
	}
};

export default [
	{
		...config,
		output: {
			...config.output,
			clean: true,
			filename: '[name].mjs',
			library: {
				type: 'module'
			}
		},
		experiments: {
			outputModule: true
		}
	},
	{
		...config,
		output: {
			...config.output,
			filename: '[name].js',
			library: {
				name: 'monomove',
				type: 'umd'
			}
		}
	}
];
