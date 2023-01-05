declare module '*.module.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.svg' {
  const content: any;
  export default content;
}

// https://stackoverflow.com/questions/49401866/all-possible-keys-of-an-union-type
type KeysOfUnion<T> = T extends T ? keyof T : never;

// https://stackoverflow.com/questions/47632622/typescript-and-filter-boolean .filter(Boolean as any as ExcludesFalse),
type ExcludesFalse = <T>(x: T | false | undefined | null) => x is T;
