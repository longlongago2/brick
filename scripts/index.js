/**
 * This library support 3 lib-types: esm, commonjs, umd
 * cjs,esm use tsup to build: https://paka.dev/npm/tsup@6.5.0/api#module-index-export-Options
 * umd use webpack to build: https://webpack.js.org/guides/author-libraries/#authoring-a-library
 * Server: use webpack-dev-server
 * Development style: support less, css modules, css-in-js
 */
/* eslint-disable no-console */
import webpack from 'webpack';
import chalk from 'chalk';
import ora from 'ora';
import { build as tsupPromise } from 'tsup';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import {
  resolveApp,
  getRules,
  getBanner,
  alias,
  externals,
  webpackPromise,
  extendTsupConfig,
} from './utils.js';

async function runComplier() {
  const spinner = ora();

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
        banner: getBanner('webpack'),
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
        .succeed(
          chalk.green('WEBPACK UMD: ') +
            chalk.bgGreen(chalk.white.bold('Build completed!')) +
            ' => ' +
            resolveApp('dist') +
            '\n'
        )
        .stop();
      log();
    })
    .catch((log) => {
      // build failed
      spinner.fail(chalk.green('WEBPACK UMD: ') + chalk.bgRed(chalk.white.bold('Build failed!\n'))).stop();
      log();
    });

  console.log('\n');

  // TSUP: build esm
  spinner.start(chalk.green('TSUP ESM: ') + chalk.bgGreen(chalk.white.bold('Building...')));
  await tsupPromise(
    extendTsupConfig({
      name: 'Typescript: building esm',
      outDir: 'esm',
      target: 'esnext',
      format: 'esm',
    })
  )
    .then(() => {
      // build complete
      spinner
        .succeed(
          chalk.green('TSUP ESM: ') +
            chalk.bgGreen(chalk.white.bold('Build completed!')) +
            ' => ' +
            resolveApp('esm') +
            '\n'
        )
        .stop();
    })
    .catch((err) => {
      // build failed
      spinner.fail(chalk.green('TSUP ESM: ') + chalk.bgRed(chalk.white.bold('Build failed!\n'))).stop();

      if (err.frame) {
        console.log(chalk.red.bold('frame:\n'));
        console.log(chalk.red(err.frame));
        console.log('\n');
        console.log(chalk.red.bold('details:\n'));
      }
      console.error(err);
    });

  console.log('\n');

  // TSUP: build cjs
  spinner.start(chalk.green('TSUP CJS: ') + chalk.bgGreen(chalk.white.bold('Building...')));
  await tsupPromise(
    extendTsupConfig({
      name: 'Typescript: building cjs',
      outDir: 'lib',
      target: 'es5',
      format: 'cjs',
    })
  )
    .then(() => {
      // build complete
      spinner
        .succeed(
          chalk.green('TSUP CJS: ') +
            chalk.bgGreen(chalk.white.bold('Build completed!')) +
            ' => ' +
            resolveApp('lib') +
            '\n'
        )
        .stop();
    })
    .catch((err) => {
      // build failed
      spinner.fail(chalk.green('TSUP CJS: ') + chalk.bgRed(chalk.white.bold('Build failed!\n'))).stop();

      if (err.frame) {
        console.log(chalk.red.bold('frame:\n'));
        console.log(chalk.red(err.frame));
        console.log('\n');
        console.log(chalk.red.bold('details:\n'));
      }
      console.error(err);
    });
}

runComplier();
