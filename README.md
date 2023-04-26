# bricky

> A rich editor based on slate.js.

`react`&nbsp;&nbsp;&nbsp;&nbsp;`slate.js`&nbsp;&nbsp;&nbsp;&nbsp;`typescript`&nbsp;&nbsp;&nbsp;&nbsp;`antd`&nbsp;&nbsp;&nbsp;&nbsp;`rich-editor`&nbsp;&nbsp;&nbsp;&nbsp;

## Usage

### 1.Install

```bash
npm install bricky
```

### 2.Javascript / Typescript

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

## Debugging / Local install

```bash
cd ~/bricky       # go into this package directory
npm link          # creates global link
cd ~/my-project   # go into some other package directory.
npm link bricky   # link-install the package, --save: change the package.json
```
