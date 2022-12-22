/**
 * This library support 3 lib-types: umd, esm, cjs
 * use webpack to build: https://webpack.js.org/guides/author-libraries/#authoring-a-library
 * since umd mode need to package some static resources, so it is easier to use webpack.
 */
/* eslint-disable no-console */
import webpack from 'webpack';
import chalk from 'chalk';
import ora from 'ora';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { resolveApp, getRules, banner, alias, externals, webpackPromise } from './utils.js';

async function runComplier() {
  const spinner = ora();
  // WEBPACK: build esm

  // WEBPACK: build cjs

  console.log('\n');

  // WEBPACK: build umd
  spinner.start(chalk.green('WEBPACK UMD: ') + chalk.bgGreen(chalk.white.bold('Building...')));
  await webpackPromise({
    mode: 'production',
    entry: resolveApp('./src/index.ts'),
    devtool: false,
    output: {
      path: resolveApp('./dist'),
      filename: 'brick.umd.min.js',
      library: {
        name: 'brick',
        type: 'umd',
      },
      clean: true,
    },
    externals,
    module: {
      parser: {
        javascript: {
          exportsPresence: 'error',
          // Disable require.ensure as it's not a standard language feature.
          requireEnsure: false,
        },
      },
      rules: getRules({ miniCssExtract: true }),
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias,
    },
    plugins: [
      new webpack.BannerPlugin({
        banner,
        entryOnly: true,
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
    ],
  })
    .then((log) => {
      // build complete
      spinner
        .succeed(chalk.green('WEBPACK UMD: ') + chalk.bgGreen(chalk.white.bold('Build completed!\n')))
        .stop();
      log();
    })
    .catch((log) => {
      // build failed
      spinner.fail(chalk.green('WEBPACK UMD: ') + chalk.bgRed(chalk.white.bold('Build failed!\n'))).stop();
      log();
    });
}

runComplier();
