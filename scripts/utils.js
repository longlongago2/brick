/* eslint-disable no-console */
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export const appDirectory = fs.realpathSync(process.cwd());

export const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

export const packageJSON = fs.readJSONSync(resolveApp('./package.json'));

export const cssModulesScopedName = '[name]__[local]___[hash:base64:5]';

const date = new Date();

const datestring = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export const banner = `[file] ${datestring}
Copyright (c) 2022, NebulaeData Ltd.
Released under the MIT License.
@version ${packageJSON.version}
@author ${packageJSON.author}
@description ${packageJSON.description}`;

export const alias = {
  brick: resolveApp('./src/index.ts'),
  src: resolveApp('./src'),
};

// peerDependencies externals
export const externals = {
  react: {
    commonjs: 'react',
    commonjs2: 'react',
    amd: 'react',
    root: 'React',
  },
  'react-dom': {
    commonjs: 'react-dom',
    commonjs2: 'react-dom',
    amd: 'react-dom',
    root: 'ReactDOM',
  },
};

const getStyleLoaders = (config) => {
  const { cssOptions, isDevelopment, miniCssExtract, preProcessor } = config || {};
  const loaders = [
    isDevelopment && 'style-loader',
    // NOTE: You should add code to `webpack.config.js -> plugins -> new MiniCssExtractPlugin()`
    !isDevelopment && miniCssExtract && MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: cssOptions,
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            [
              'postcss-preset-env',
              {
                autoprefixer: {
                  flexbox: 'no-2009',
                },
                stage: 3,
              },
            ],
          ],
        },
        sourceMap: false,
      },
    },
    preProcessor && {
      loader: 'less-loader',
      options: {
        lessOptions: {},
      },
    },
  ];
  return loaders.filter(Boolean);
};

export const getRules = (config) => {
  const { isDevelopment, miniCssExtract } = config || {};
  return [
    {
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      include: [resolveApp('src'), isDevelopment && resolveApp('serve')].filter(Boolean),
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  useBuiltIns: 'usage',
                  corejs: '3.2',
                },
              ],
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [isDevelopment && 'react-refresh/babel'].filter(Boolean),
          },
        },
      ],
    },
    {
      test: /\.css$/,
      exclude: /\.module\.css$/,
      use: getStyleLoaders({
        cssOptions: {
          importLoaders: 1,
          sourceMap: false,
        },
        isDevelopment,
        miniCssExtract,
        preProcessor: false,
      }),
    },
    {
      test: /\.module\.css$/,
      use: getStyleLoaders({
        cssOptions: {
          importLoaders: 1,
          sourceMap: false,
          // css modules
          modules: {
            localIdentName: cssModulesScopedName,
          },
        },
        isDevelopment,
        miniCssExtract,
        preProcessor: false,
      }),
    },
    {
      test: /\.less$/,
      exclude: /\.module\.less$/,
      use: getStyleLoaders({
        cssOptions: {
          importLoaders: 3,
          sourceMap: false,
        },
        isDevelopment,
        miniCssExtract,
        preProcessor: true,
      }),
    },
    {
      test: /\.module\.less$/,
      use: getStyleLoaders({
        cssOptions: {
          importLoaders: 3,
          sourceMap: false,
          // css modules
          modules: {
            localIdentName: cssModulesScopedName,
          },
        },
        isDevelopment,
        miniCssExtract,
        preProcessor: true,
      }),
    },
    // 将 svg 图标作为 React 组件导入
    // import Icon from '@ant-design/icons/lib/components/Icon';
    // import MessageSvg from 'path/to/message.svg';
    // <Icon component={MessageSvg} />
    {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      use: [
        {
          loader: 'babel-loader',
        },
        {
          loader: '@svgr/webpack',
          options: {
            babel: false,
            icon: true,
          },
        },
      ],
    },
  ];
};

/**
 * @description webpack complier promise function
 * @export
 * @param {webpack.Configuration} config
 * @return {Promise}
 */
export function webpackPromise(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      const info = stats.toJson();

      // Build failed
      if (err || stats.hasErrors()) {
        const log = () => {
          // Logging errors
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
        };

        reject(log);

        return;
      }

      // Build completed
      const log = () => {
        // Logging warnings
        if (stats.hasWarnings()) {
          const { warnings } = info;
          console.log(chalk.bgYellow(chalk.white.bold('Warnings\n')));

          warnings.forEach((warn) => {
            console.log(chalk.yellow(warn.message));
          });
        }
      };

      resolve(log);
    });
  });
}
