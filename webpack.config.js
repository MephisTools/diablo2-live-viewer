'use strict'

const { resolve } = require('path')
const merge = require('webpack-merge')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const ENV = process.argv.find(arg => arg.includes('production'))
  ? 'production'
  : 'development'
const OUTPUT_PATH = ENV === 'production' ? resolve('dist') : resolve('src')
const INDEX_TEMPLATE = resolve('./src/index.html')

const assets = [
  {
    from: resolve('./src/assets'),
    to: resolve('dist/assets/')
  }
]

const commonConfig = merge([
  {
    entry: './src/diablo2-live-viewer.js',
    output: {
      path: OUTPUT_PATH,
      filename: '[name].[chunkhash:8].js'
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            'to-string-loader',
            'css-loader'
          ]
        },
        {
          test: /\.png$/,
          use: [
            'file-loader'
          ]
        },
        {
          test: /\.gif$/,
          use: [
            'file-loader'
          ]
        },
        {
          test: /\.txt$/,
          use: [
            'raw-loader'
          ]
        }
      ]
    }
  }
])

const developmentConfig = merge([
  {
    devtool: 'cheap-module-source-map',
    plugins: [
      new HtmlWebpackPlugin({
        template: INDEX_TEMPLATE
      })
    ],

    devServer: {
      contentBase: OUTPUT_PATH,
      compress: true,
      overlay: true,
      port: 3000,
      historyApiFallback: true,
      host: 'localhost'
    }
  }
])

const productionConfig = merge([
  {
    devtool: 'nosources-source-map',
    plugins: [
      new CleanWebpackPlugin([OUTPUT_PATH], { verbose: true }),
      new CopyWebpackPlugin([...assets]),
      new HtmlWebpackPlugin({
        template: INDEX_TEMPLATE,
        minify: {
          collapseWhitespace: true,
          removeComments: true,
          minifyCSS: true,
          minifyJS: true
        }
      })
    ]
  }
])

module.exports = mode => {
  if (mode === 'production') {
    return merge(commonConfig, productionConfig, { mode })
  }

  return merge(commonConfig, developmentConfig, { mode })
}
