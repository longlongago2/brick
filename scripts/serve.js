/* eslint-disable no-console */
import chalk from 'chalk';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { resolveApp, getRules, alias } from './utils.js';

const compiler = webpack({
  mode: 'development',
  entry: resolveApp('./serve/index.tsx'),
  devtool: 'inline-source-map',
  stats: 'normal',
  module: {
    rules: getRules({ isDevelopment: true, miniCssExtract: false }),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias,
  },
  plugins: [
    new ReactRefreshWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'brick.dev',
      template: resolveApp('./public/index.html'),
      scriptLoading: 'defer',
      favicon: resolveApp('./public/favicon.ico'),
    }),
  ],
});

const server = new WebpackDevServer(
  {
    port: 5050,
    open: true,
    hot: true,
    compress: true,
    client: {
      logging: 'error', // Browser console log
      overlay: true, // If error occurs, the info will cover the browser window
    },
  },
  compiler
);

const runServer = async () => {
  console.log('⚡ ', chalk.bgGreen(chalk.white.bold(' Starting service... ')));
  await server.start();
  console.log('⚡ ', chalk.bgGreen(chalk.white.bold(' Startup complete! ')));
};

runServer();
