/**
 * This library support 3 lib-types: umd, esm, commonjs
 * cjs,esm use rollup to build: https://rollupjs.org/guide/en/
 * umd use webpack to build: https://webpack.js.org/guides/author-libraries/#authoring-a-library
 * Since umd mode need to package some static resources, so it is easier to use webpack.
 */
import webpack from 'webpack';
import chalk from 'chalk';
import glob from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import autoprefixer from 'autoprefixer';
import postcss from 'rollup-plugin-postcss';
import rollupAlias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import {
  resolveApp,
  getRules,
  banner,
  alias,
  getBanner,
  rollupBuild,
  cssModulesScopedName,
} from './utils.js';

// Rollup: build cjs, esm
rollupBuild({
  input: Object.fromEntries(
    glob.sync('src/**/*').map((file) => [
      // This remove `src/` as well as the file extension from each file, so e.g.
      // src/nested/foo.js becomes nested/foo
      path.relative('src', file.slice(0, file.length - path.extname(file).length)),
      // This expands the relative paths to absolute paths, so e.g.
      // src/nested/foo becomes /project/src/nested/foo.js
      fileURLToPath(new URL(file, import.meta.url)),
    ])
  ),
  output: [
    {
      format: 'esm', // https://rollupjs.org/guide/en/#outputformat
      dir: 'esm',
      exports: 'auto',
      banner: getBanner,
    },
    {
      format: 'cjs',
      dir: 'lib',
      exports: 'auto',
      banner: getBanner,
    },
  ],
  treeshake: true,
  external: ['react', 'react-dom'],
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    resolve({
      moduleDirectories: ['node_modules'],
    }),
    // Complier Typescript: the plugin loads any compilerOptions from the tsconfig.json file by default.
    typescript(),
    // Compiler Sass/Stylus/Less
    // For Sass install node-sass: yarn add node-sass --dev
    // For Stylus Install stylus: yarn add stylus --dev
    // For Less Install less: yarn add less --dev
    postcss({
      extract: false, // Extract CSS
      // CSS modules
      modules: {
        generateScopedName: cssModulesScopedName,
      },
      // Automatically enable CSS modules for
      // .module.css .module.sss .module.scss .module.sass .module.styl .module.stylus .module.less files.
      autoModules: true,
      plugins: [
        autoprefixer(), // browserslist
      ],
      minimize: true,
      sourceMap: false,
    }),
    rollupAlias({
      entries: alias,
    }),
  ],
});

// WEBPACK: build umd
webpack(
  {
    mode: 'production',
    entry: resolveApp('./src/index.tsx'),
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
    externals: {
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
    },
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
    if (err) {
      console.log('❗ ' + chalk.green('Webpack ') + chalk.bgRed(chalk.white.bold(' Build umd failed! ')));
      if (err.details) {
        console.error(err.details);
      } else {
        console.error(err.stack || err);
      }
      return;
    }

    // build complete
    console.log('🚩 ' + chalk.green('Webpack ') + chalk.bgGreen(chalk.white.bold(' Build umd complete! ')));

    // warnings
    const info = stats.toJson();
    if (stats.hasWarnings()) {
      const { warnings } = info;
      console.log(chalk.bgYellow(chalk.white.bold(' Warnings ')));

      warnings.forEach((warn) => {
        console.log(chalk.yellow(warn.message));
      });
    }
  }
);
