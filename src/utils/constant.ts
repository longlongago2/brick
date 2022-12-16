import type { CSSProperties } from 'react';
import type { Element, MarkKeys } from 'slate';

export const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

// 行内元素类型定义
export const INLINE_TYPES = ['link'];

// 虚空元素类型：Void Element 经常用于不能编辑的元素
export const VOID_TYPES = ['image'];

// List 元素：含有元素 List Item
export const LIST_TYPES = ['bulleted-list', 'numbered-list'];

// Align 类型
export type TextAlign = Exclude<CSSProperties['textAlign'], undefined>;

export const TEXT_ALIGN_TYPES: TextAlign[] = ['left', 'center', 'right', 'justify'];

// 无副作用的类型：可以直接 Toggle 的 Element 类型
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

export const NO_EFFECT_WRAP_TYPES: NoEffectWrapTypes[] = [
  'paragraph',
  'heading-one',
  'heading-two',
  'heading-three',
  'heading-four',
  'heading-five',
  'heading-six',
  'block-quote',
  'bulleted-list',
  'numbered-list',
];

// HotKeys：编辑器快捷键
export interface HotKeys {
  marks: Record<string, MarkKeys>;
  nodes: Record<string, Element['type']>;
  aligns: Record<string, TextAlign>;
}

export const HOTKEYS: HotKeys = {
  marks: {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline',
    'mod+`': 'code',
    'mod+m': 'highlight',
    'mod+alt+s': 'linethrough',
  },
  nodes: {
    'mod+alt+1': 'heading-one',
    'mod+alt+2': 'heading-two',
    'mod+alt+3': 'heading-three',
    'mod+alt+4': 'heading-four',
    'mod+alt+5': 'heading-five',
    'mod+alt+6': 'heading-six',
    'mod+alt+q': 'block-quote',
    'mod+alt+o': 'numbered-list',
    'mod+alt+u': 'bulleted-list',
  },
  aligns: {
    'mod+alt+l': 'left',
    'mod+alt+r': 'right',
    'mod+alt+c': 'center',
    'mod+alt+j': 'justify',
  },
};
