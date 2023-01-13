/* eslint-disable no-console */
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import webpack from 'webpack';
import cssModulesPlugin from 'esbuild-css-modules-plugin';
import { lessLoader } from 'esbuild-plugin-less';
import svgrPlugin from 'esbuild-plugin-svgr';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export const appDirectory = fs.realpathSync(process.cwd());

export const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

export const packageJSON = fs.readJSONSync(resolveApp('./package.json'));

export const cssModulesScopedName = '[name]__[local]___[hash:base64:5]';

const date = new Date();

const datestring = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export const getBanner = (platform) => {
  if (platform === 'webpack') {
    return `${packageJSON.name} v${packageJSON.version} ${datestring}
Copyright (c) 2022, NebulaeData Ltd.
Released under the MIT License.`;
  }
  if (platform === 'tsup') {
    return `/**
 * ${packageJSON.name} v${packageJSON.version} ${datestring}
 * Copyright (c) 2022, NebulaeData Ltd.
 * Released under the MIT License.
 */
`;
  }
};

/**
 * @description 继承公共的tsup配置
 * @export
 * @param {import('tsup').Options} overrideOptions
 * @return {import('tsup').Options}
 */
export function extendTsupConfig(overrideOptions) {
  return {
    entry: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
    platform: 'browser',
    dts: true,
    clean: true,
    minify: false,
    splitting: false,
    treeshake: true,
    bundle: false, // TODO: 1.解决src路径问题；2.解决svgr的问题 如果不开启 bundle, src不会转义，开发模式一样引用路径，会造成问题，svgr不打包也会引起问题。
    sourcemap: false,
    injectStyle: true,
    replaceNodeEnv: true,
    silent: true,
    shims: false,
    // 仅当 bundle: true 时生效：跳过打包 node_modules, 优先级低于 noExternal
    skipNodeModulesBundle: false,
    // 仅当 bundle: true 时生效：与webpack external同步。
    external: ['react', 'react-dom', 'slate', 'slate-react', 'slate-history', 'slate-hyperscript'],
    esbuildPlugins: [
      // 仅当 bundle: true 时生效：和 webpack 作用相同：svg 作为 react component 导入。
      svgrPlugin({
        memo: true,
        icon: true,
      }),
      // 仅当 bundle: true 时生效：尽量和 webpack 同步支持 css modules (此插件未经测试)
      cssModulesPlugin({
        filter: /\.module\.css$/,
      }),
      // 仅当 bundle: true 时生效：处理 less, 尽量和 webpack 同步支持 css modules
      lessLoader(
        {},
        {
          filter: /\.less$/,
        }
      ),
    ],
    banner: {
      js: getBanner('tsup'),
    },
    outExtension() {
      return {
        js: '.js', // 所有js后缀名全都设为'.js',避免出现'.cjs','.mjs' outExtension({ format }),也可根据format动态设置
      };
    },
    ...overrideOptions,
    // ts 打包配置使用tsconfig.json,例如 paths alias 包路径别名,就在tsconfig.json => paths 配置
  };
}

// 需要和以下配置文件同步配置项
// Typescript: tsconfig.json => paths
// Esllint: package.json => eslintConfig => import/resolver => alias
export const alias = {
  bricky: resolveApp('./src'),
};

// peerDependencies externals
// <script src="https://unpkg.com/react/umd/react.production.min.js"></script>
// <script src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
// <script src="https://unpkg.com/slate/dist/slate.js"></script>
// <script src="https://unpkg.com/slate-react/dist/slate-react.js"></script>
// <script src="https://unpkg.com/slate-history/dist/slate-history.js"></script>
// <script src="https://unpkg.com/slate-hyperscript/dist/slate-hyperscript.js"></script>
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
  slate: {
    commonjs: 'slate',
    commonjs2: 'slate',
    amd: 'slate',
    root: 'Slate',
  },
  'slate-react': {
    commonjs: 'slate-react',
    commonjs2: 'slate-react',
    amd: 'slate-react',
    root: 'SlateReact',
  },
  'slate-history': {
    commonjs: 'slate-history',
    commonjs2: 'slate-history',
    amd: 'slate-history',
    root: 'SlateHistory',
  },
  'slate-hyperscript': {
    commonjs: 'slate-hyperscript',
    commonjs2: 'slate-hyperscript',
    amd: 'slate-hyperscript',
    root: 'SlateHyperscript',
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
        // use postcss.config.js
        postcssOptions: {},
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
            // use babel.config.json
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
            memo: true,
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

export function copyDTS(srcDir, destDir) {
  const files = fs.readdirSync(srcDir).filter((fn) => fn.endsWith('.d.ts'));
  files.map((file) => {
    const filePath = resolveApp(srcDir + '/' + file);
    const destPath = resolveApp(destDir + '/' + file);
    fs.copyFileSync(filePath, destPath);
  });
}
