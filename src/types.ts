import type { CSSProperties } from 'react';
import type { Node, Path } from 'slate';

// types.ts: 可共用用的类型定义

/**
 * @description 搜索结果类型
 */
export type SearchResult = {
  key: string;
  offset: number;
  search: string;
  node: Node;
  path: Path;
};

/**
 * @description 字符串扩展类型
 */
export type DefinedType = string | [string, Record<string, any>];


/**
 * @description 文本对齐类型
 */
export type TextAlign = Exclude<CSSProperties['textAlign'], undefined>;

/**
 * @description 无副作用的类型：可以直接 Toggle 的 Element 类型
 */
export type NoEffectWrapTypes =
  | 'paragraph'
  | 'heading-one'
  | 'heading-two'
  | 'heading-three'
  | 'heading-four'
  | 'heading-five'
  | 'heading-six'
  | 'block-quote'
  | 'bulleted-list'
  | 'numbered-list';
