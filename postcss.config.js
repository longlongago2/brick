import postcssPresetEnv from 'postcss-preset-env';

module.exports = {
  plugins: [
    postcssPresetEnv({
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
    }),
  ],
};
