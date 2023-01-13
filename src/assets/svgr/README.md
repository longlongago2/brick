# svgr

> The folder svgr is the source of svg react components, **you do not need to copy the folder to the lib or esm**. because of tsup config `bundle: false`, the file \*.svg will not be resolved by the svgr plugin. so we should compile it in advance.

Execute the following command. the svg file will compile to a react component

`npm run svgr`

then, we can use

```js
import Icon from '@ant-design/icons';
import { SvgrIconName } from 'src/components/SvgrIcons';

function Component() {
  return <Icon component={SvgrIconName} />;
}
```
