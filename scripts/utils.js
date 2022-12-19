import path from 'path';
import fs from 'fs-extra';
import { rollup } from 'rollup';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export const appDirectory = fs.realpathSync(process.cwd());

export const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

export const packageJSON = fs.readJSONSync(resolveApp('./package.json'));

export const cssModulesScopedName = '[name]__[local]___[hash:base64:5]';

const date = new Date();
const datestring = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
export const banner = `[file] ${datestring}\n@version ${packageJSON.version}\n@author ${packageJSON.author}\n@description ${packageJSON.description}`;

export const getBanner = ({ fileName }) => `
/**
 * ${fileName}
 * @time ${date}
 * @version ${packageJSON.version}
 * @author ${packageJSON.author}
 * @description ${packageJSON.description}
 */
`;

export const alias = {
  brick: resolveApp('./src/index.tsx'),
  src: resolveApp('./src'),
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
            localIdentName: '[path][name]__[local]--[hash:base64:5]',
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
 * @description rollup build
 * @export
 * @param {import('rollup').RollupOptions} config
 */
export async function rollupBuild(config) {
  let bundle;
  let buildFailed = false;
  try {
    // create a bundle
    bundle = await rollup(config);

    // an array of file names this bundle depends on
    console.log(bundle.watchFiles);

    const outputOptionsList = [].concat(config.output);

    for (const outputOptions of outputOptionsList) {
      // generate output specific code in-memory
      // you can call this function multiple times on the same bundle object
      // replace bundle.generate with bundle.write to directly write to disk
      const { output } = await bundle.generate(outputOptions);

      for (const chunkOrAsset of output) {
        if (chunkOrAsset.type === 'asset') {
          // For assets, this contains
          // {
          //   fileName: string,              // the asset file name
          //   source: string | Uint8Array    // the asset source
          //   type: 'asset'                  // signifies that this is an asset
          // }
          console.log('Asset', chunkOrAsset);
        } else {
          // For chunks, this contains
          // {
          //   code: string,                  // the generated JS code
          //   dynamicImports: string[],      // external modules imported dynamically by the chunk
          //   exports: string[],             // exported variable names
          //   facadeModuleId: string | null, // the id of a module that this chunk corresponds to
          //   fileName: string,              // the chunk file name
          //   implicitlyLoadedBefore: string[]; // entries that should only be loaded after this chunk
          //   imports: string[],             // external modules imported statically by the chunk
          //   importedBindings: {[imported: string]: string[]} // imported bindings per dependency
          //   isDynamicEntry: boolean,       // is this chunk a dynamic entry point
          //   isEntry: boolean,              // is this chunk a static entry point
          //   isImplicitEntry: boolean,      // should this chunk only be loaded after other chunks
          //   map: string | null,            // sourcemaps if present
          //   modules: {                     // information about the modules in this chunk
          //     [id: string]: {
          //       renderedExports: string[]; // exported variable names that were included
          //       removedExports: string[];  // exported variable names that were removed
          //       renderedLength: number;    // the length of the remaining code in this module
          //       originalLength: number;    // the original length of the code in this module
          //       code: string | null;       // remaining code in this module
          //     };
          //   },
          //   name: string                   // the name of this chunk as used in naming patterns
          //   referencedFiles: string[]      // files referenced via import.meta.ROLLUP_FILE_URL_<id>
          //   type: 'chunk',                 // signifies that this is a chunk
          // }
          console.log('Chunk', chunkOrAsset.modules);
        }
      }
    }
  } catch (error) {
    buildFailed = true;
    // do some error reporting
    console.error(error);
  }
  if (bundle) {
    // closes the bundle
    await bundle.close();
  }
  process.exit(buildFailed ? 1 : 0);
}
