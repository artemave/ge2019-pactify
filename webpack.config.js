/* eslint filenames/match-exported: 0 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const mode = process.env.NODE_ENV === 'production'
  ? 'production'
  : 'development'

const devtool = mode === 'production'
  ? 'source-map'
  : 'eval-source-map'

const plugins = [
  new CleanWebpackPlugin(),
  new MiniCssExtractPlugin({
    filename: '[contenthash].[name].css',
  }),
  new HtmlWebpackPlugin({
    inject: false,
    template: require('html-webpack-template'),
    googleAnalytics: {
      trackingId: mode === 'production' ? 'UA-154899468-1' : 1,
      pageViewOnLoad: true,
    },
    title: 'Online tool to see what might have happened if Labour had an election pact with other remain parties',
    meta: [{
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    }]
  })
]

if (mode === 'production') {
  plugins.push(new CompressionPlugin())
}

const webpackConfig = {
  mode,
  devtool,
  entry: './browser/index.js',
  devServer: {
    historyApiFallback: true,
    hot: false,
    inline: false,
    liveReload: false
  },
  output: {
    filename: '[contenthash].bundle.js',
    path: path.resolve(__dirname, 'browser', 'dist')
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader'
      },
      {
        test: /vendor\.sass$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          },
          'sass-loader'
        ]
      }
    ]
  }
}

if (mode === 'production') {
  webpackConfig.optimization = {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true // set to true if you want JS source maps
      })
    ]
  }
}

module.exports = webpackConfig
