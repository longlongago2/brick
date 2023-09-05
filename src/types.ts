import type { CSSProperties } from 'react';
import type { Element, MarkText, BaseRange, Node, AdvancedHighlight } from 'slate';

/**
 * @description Slate Editor 装饰器的 range 类型
 */
export type DecorateRange = BaseRange & Omit<MarkText, 'text'>;

/**
 * @description Slate Editor 元素属性名称
 */
export type ElementKeys = KeysOfUnion<Element>;

/**
 * @description Slate Editor mark 文本属性名称
 */
export type MarkKeys = keyof Omit<MarkText, 'text'>;

/**
 * @description 字符串扩展类型
 */
export type DefinedType = string | [string, Record<string, any>];

/**
 * @description 文本对齐类型
 */
export type TextAlign = Exclude<CSSProperties['textAlign'], undefined>;

/**
 * @description 获取联合类型的所有 key: https://stackoverflow.com/questions/49401866/all-possible-keys-of-an-union-type
 * @example type A = { a: string } | { b: string } | { c: string }; type B = KeysOfUnion<A>; // "a" | "b" | "c"
 */
export type KeysOfUnion<T> = T extends T ? keyof T : never;

/**
 * @description filter(Boolean): https://stackoverflow.com/questions/47632622/typescript-and-filter-boolean
 * @example [1, 2, 3, false, 4, 5, undefined, null].filter(Boolean as any as ExcludeNullableFunc) // [1, 2, 3, 4, 5]
 */
export type ExcludeNullableFunc = <T>(x: T | false | undefined | null) => x is T;

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

/**
 * @description 热键配置数据类型
 */
export interface HotKeys {
  marks: Record<string, MarkKeys>;
  nodes: Record<string, Element['type']>;
  aligns: Record<string, TextAlign>;
}

/**
 * @description 编辑器自定义命令类型
 */
export interface CommandEditor {
  /**
   * @descriptionZH 标记类型是否处于激活状态
   * @descriptionEN
   * @memberof CommandEditor
   */
  isMarkActive: (name: MarkKeys) => boolean;

  /**
   * @descriptionZH 获取标记类型的属性值
   * @descriptionEN
   * @memberof CommandEditor
   */
  getMarkProperty: (name: MarkKeys) => any;

  /**
   * @descriptionZH 设置标记类型的属性值
   * @descriptionEN
   * @memberof CommandEditor
   */
  setMarkProperty: (name: MarkKeys, value: any) => void;

  /**
   * @descriptionZH 应用/取消标记类型
   * @descriptionEN
   * @memberof CommandEditor
   */
  toggleMark: (name: MarkKeys) => void;

  /**
   * @descriptionZH 某节点类型是否处于当前焦点
   * @descriptionEN
   * @memberof CommandEditor
   */
  isElementActive: (type: Element['type']) => boolean;

  /**
   * @descriptionZH 应用/取消某节点类型
   * @descriptionEN
   * @memberof CommandEditor
   */
  toggleElement: (type: NoEffectWrapTypes) => void;

  /**
   * @descriptionZH 设置元素属性值 `refactor:true`重构：先删后增，解决inline转换问题
   * @descriptionEN
   * @memberof CommandEditor
   */
  setElementProperties: (
    type: Element['type'],
    properties: Record<string, any>,
    options?: { refactor: boolean }
  ) => void;

  /**
   * @descriptionZH 移除指定类型元素
   * @descriptionEN
   * @memberof CommandEditor
   */
  removeElement: (type: Element['type']) => void;

  /**
   * @descriptionZH 应用/取消该文本对齐方式
   * @descriptionEN
   * @memberof CommandEditor
   */
  toggleAlign: (align: TextAlign) => void;

  /**
   * @descriptionZH 开启/关闭当前节点锁定状态
   * @descriptionEN
   * @memberof CommandEditor
   */
  toggleLock: (type: Element['type']) => void;

  /**
   * @descriptionZH 获取指定节点的信息
   * @descriptionEN
   * @memberof CommandEditor
   */
  getElementFieldsValue: (fields?: ElementKeys | ElementKeys[] | true, type?: Element['type']) => any;

  /**
   * @descriptionZH 设置超链接，如果已存在超链接则更新，否则新增
   * @descriptionEN set hyperlink
   * @memberof CommandEditor
   */
  setLink: (url: string) => void;

  /**
   * @descriptionZH 取消超链接
   * @descriptionEN cancel hyperlink
   * @memberof CommandEditor
   */
  unsetLink: () => void;

  /**
   * @descriptionZH 获取当前selection的DOMRect对象，其提供了selection的大小及其相对于视口的位置，常用于定位。
   * @descriptionEN
   * @memberof CommandEditor
   */
  getBoundingClientRect: () => DOMRect | null;

  /**
   * @descriptionZH 获取编辑区DOM
   * @descriptionEN
   * @memberof CommandEditor
   */
  getEditableDOM: () => HTMLElement;

  /**
   * @descriptionZH 挂载在实例上的一些额外的属性
   * @descriptionEN some extra attributes on the instance
   * @type {Record<string, any>}
   * @memberof CommandEditor
   */
  extraProperty?: Record<string, any>;

  /**
   * @descriptionZH 添加额外属性
   * @descriptionEN Add an extra attribute
   * @memberof CommandEditor
   */
  addExtraProperty: (key: string, value: any) => void;

  /**
   * @descriptionZH 移除实例上指定的额外属性
   * @descriptionEN Remove extra attributes specified on the instance
   * @memberof CommandEditor
   */
  removeExtraProperty: (key: string) => void;
}

/**
 * @description 搜索结果项类型定义
 */
export interface SearchNode {
  key: string;
  search: string;
  node: Node;
  range: BaseRange;
}

/**
 * @description 搜索功能上下文数据类型定义
 */
export interface SlateSearch {
  /**
   * @description 设置搜索关键字
   */
  setKeyword: React.Dispatch<React.SetStateAction<string>>;

  /**
   * @description 设置当前激活的搜索结果项
   */
  setActiveKey: React.Dispatch<React.SetStateAction<string>>;

  /**
   * @description 重置搜索
   */
  reset: () => void;

  /**
   * @description 获取当前搜索状态
   */
  getState: () => {
    keyword: string;
    activeKey: string;
    results: SearchNode[];
  };

  /**
   * @description 强制收集搜索结果
   */
  forceCollectSearchResult: () => void;

  /**
   * @description 创建搜索结果标记
   */
  createSearchMark: (key: string) => { highlight: AdvancedHighlight };
}
