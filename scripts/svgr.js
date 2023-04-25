/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import { glob } from 'glob';
import { transform } from '@svgr/core';
import { resolveApp } from './utils.js';

// Entry
const entry = 'src/assets/svgr/**/*.svg';

// Output
const output = 'src/components/Icons/index.tsx';

// Compiler
const spinner = ora();

const camelcase = (str) => {
  const regexp = new RegExp('-(\\w)', 'g');
  return str.replace(regexp, ($0, $1) => $1.toUpperCase());
};

try {
  spinner.start(chalk.green('Svgr: ') + chalk.bgGreen(chalk.white.bold('Compiling...')));

  let components = ['import React, { memo, SVGProps } from \'react\';'];

  const files = glob.sync(entry, { debug: false, absolute: true });

  files.map((file) => {
    const basename = path.basename(file, '.svg');
    const iconName = camelcase('Svgr' + '-' + basename);
    const svgCode = fs.readFileSync(file, { encoding: 'utf-8' });
    const jsCode = transform.sync(
      svgCode,
      {
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx', '@svgr/plugin-prettier'],
        icon: true,
        typescript: true,
        prettier: true,
        template(variables, { tpl }) {
          const { componentName, props, jsx, interfaces } = variables;
          return tpl`
        ${interfaces}

        const ${componentName + 'Native'} = (${props}) => ${jsx};

        export const ${componentName} = memo(${componentName + 'Native'});
        `;
        },
      },
      { componentName: iconName }
    );
    components.push(jsCode);
  });

  fs.writeFileSync(resolveApp(output), components.join('\n'));

  // Compile success
  spinner
    .succeed(
      chalk.green('Svgr: ') +
        chalk.bgGreen(chalk.white.bold('Compile completed!')) +
        ' => ' +
        resolveApp('src/components/Icons/index.tsx') +
        '\n'
    )
    .stop();
} catch (err) {
  // Compile failed
  spinner.fail(chalk.green('Svgr: ') + chalk.bgRed(chalk.white.bold('Compile failed!\n'))).stop();
  console.error(err);
}
