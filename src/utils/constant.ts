import type { DefinedType, TextAlign, NoEffectWrapTypes } from '../types';
import type { HotKeys } from '../interface';

/**
 * @description 是否为开发环境
 */
export const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

/**
 * @description 定义富文本编辑器的行内元素类型
 */
export const INLINE_TYPES: DefinedType[] = [
  'link',
  ['image', { inline: true }],
  ['formula', { inline: true }],
  ['video', { inline: true }],
  ['audio', { inline: true }],
];

/**
 * @description 定义富文本的虚空元素类型：Void Element 经常用于不使用原始渲染，自定义渲染的元素。
 */
export const VOID_TYPES: DefinedType[] = ['image', 'formula', 'video', 'audio'];

/**
 * @description 定义富文本的列表元素类型：一般是含有元素 List Item 元素的 Element
 */
export const LIST_TYPES: string[] = ['bulleted-list', 'numbered-list'];

/**
 * @description 定义富文本文本对齐类型
 */
export const TEXT_ALIGN_TYPES: TextAlign[] = ['left', 'center', 'right', 'justify'];

/**
 * @description 定义富文本的无副作用的类型：可以直接 Toggle 的 Element 类型
 */
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

/**
 * @description 定义富文本热键配置数据
 */
export const HOTKEYS: HotKeys = {
  marks: {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline',
    'mod+`': 'code',
    'mod+m': 'highlight',
    'mod+alt+s': 'linethrough',
    'mod+.': 'superscript',
    'mod+,': 'subscript',
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
