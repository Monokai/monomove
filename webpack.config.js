const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const ROOT = __dirname;

const babelPresets = [
	[
		'@babel/preset-env',
		{
			'useBuiltIns': 'usage',
			'corejs'     : 3
		}
	]
];

module.exports = {
	output: {
		path    : path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		clean   : true
	},
	entry: {
		'monomove': {
			import: './src/index.js',
			library: {
				name: 'monomove',
				type: 'umd'
			}
		}
	},
	resolve: {
		modules: [
			path.join(ROOT, 'src'),
			path.join(ROOT, 'node_modules')
		],
		extensions: ['.js'],
	},
	optimization: {
		minimizer: [new TerserPlugin({
			parallel     : true,
			terserOptions: {
				compress: {
					drop_console: false,
					passes      : 2
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