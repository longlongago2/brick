import glob from 'glob';
import fs from 'fs';
import path from 'path';
import { transform } from '@svgr/core';
import { resolveApp } from './utils';

const camelcase = (str) => {
  const regexp = new RegExp('-(\\w)', 'g');
  return str.replace(regexp, ($0, $1) => $1.toUpperCase());
};

let components = ['import { memo } from "react";'];

const files = glob.sync('src/assets/svgr/**/*.svg', { debug: false, absolute: true });

files.map((file) => {
  const basename = path.basename(file, '.svg');
  const componentName = camelcase('Svgr' + '-' + basename);
  const data = fs.readFileSync(file, { encoding: 'utf-8' });
  const jsCode = transform.sync(
    data,
    {
      icon: true,
      // memo: true,
      // jsxRuntime: 'automatic',
      template(variables, { tpl }) {
        const { componentName, props, jsx } = variables;
        return tpl`
          const ${componentName + 'Native'} = (${props}) => ${jsx};

          export const ${componentName} = memo(${componentName + 'Native'});
          `;
      },
    },
    { componentName }
  );
  components.push(jsCode);
});

fs.writeFile(resolveApp('./assets/svgr/index.js'), components.join('\n'));
