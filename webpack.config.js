const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/main.js',
    output: {
      filename: isProduction ? 'bpmn-analyzer.[contenthash].js' : '[name].js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
    },
    cache: false,
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    devServer: {
      static: [
        { directory: path.join(__dirname, 'dist') },
        { directory: path.join(__dirname, 'public') },
        { directory: path.join(__dirname, 'samples'), publicPath: '/samples' }
      ],
      compress: true,
      port: 9000,
      hot: true,
      historyApiFallback: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-transform-runtime']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './index.html',
        minify: isProduction ? {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          useShortDoctype: true
        } : false,
      }),
      ...(isProduction && env.analyze ? [new BundleAnalyzerPlugin()] : []),
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            chunks: 'initial',
            reuseExistingChunk: true,
          },
        },
      },
      runtimeChunk: 'single',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@modules': path.resolve(__dirname, 'src/modules'),
        '@utils': path.resolve(__dirname, 'src/utils'),
      },
      extensions: ['.js', '.json'],
    },
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  };
};
