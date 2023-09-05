# bricky

> 一款基于 slate.js 的富文本编辑器

`react`&nbsp;&nbsp;&nbsp;&nbsp;`slate.js`&nbsp;&nbsp;&nbsp;&nbsp;`typescript`&nbsp;&nbsp;&nbsp;&nbsp;`antd`&nbsp;&nbsp;&nbsp;&nbsp;`rich-editor`&nbsp;&nbsp;&nbsp;&nbsp;

## 使用

### 1、安装

```bash
npm install bricky
```

### 2、Javascript / Typescript


#### app.tsx

```javascript
import { Editor } from 'bricky';
```

#### tsconfig.json

```json
{
  "compilerOptions": { },
  "include": [
    "src",
    "./node_modules/bricky/esm/slate.d.ts" // extend slate CustomTypes
    ]
}
```

or

#### vite-env.d.ts

```typescript
/// <reference types="bricky/esm/slate.d.ts" />
```

## 本地安装调试

```bash
cd ~/bricky       # 进入本项目根目录
npm link          # 将本项目包创建全局链接，类似安装到全局
cd ~/my-project   # 进入其他项目目录
npm link bricky   # 链接 bricky 包, --save: 保存到 package.json
```
