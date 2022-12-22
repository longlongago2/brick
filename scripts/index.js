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
import { resolveApp, getRules, banner, alias, externals } from './utils.js';

// WEBPACK: build cjs

// WEBPACK: build esm

// WEBPACK: build umd TODO: 利用Promise封装一下，同步打包。
const umdSpinner = ora().start('UMD Packaging');
webpack(
  {
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
  },
  (err, stats) => {
    const info = stats.toJson();

    if (err || stats.hasErrors()) {
      // build failed
      umdSpinner
        .fail(chalk.green('WEBPACK UMD: ') + chalk.bgRed(chalk.white.bold(' Build failed! \n')))
        .stop();

      // errors
      if (err) {
        if (err.details) {
          console.error(err.details);
        } else {
          console.error(err.stack || err);
        }
      } else {
        const { errors } = info;
        errors.forEach((error) => {
          console.error(error.message);
        });
      }

      return;
    }

    // build complete
    umdSpinner
      .succeed(chalk.green('WEBPACK UMD: ') + chalk.bgGreen(chalk.white.bold(' Build complete! \n')))
      .stop();

    // warnings
    if (stats.hasWarnings()) {
      const { warnings } = info;
      console.log(chalk.bgYellow(chalk.white.bold(' WEBPACK UMD: Warnings ')));

      warnings.forEach((warn) => {
        console.log(chalk.yellow(warn.message));
      });
    }
  }
);
