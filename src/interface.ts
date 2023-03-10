import type { Element, MarkKeys } from 'slate';
import type { TextAlign, SearchResult } from './types';

// interface.ts: 可共用用的类型定义

/**
 * @description 热键配置数据类型
 */
export interface HotKeys {
  marks: Record<string, MarkKeys>;
  nodes: Record<string, Element['type']>;
  aligns: Record<string, TextAlign>;
}

/**
 * @description 编辑器外围数据类型
 */
export interface AccessoryValues {
  researching: boolean; // 正在搜索中
  search: string;
  setSearch: (value: string) => void;
  activeSearchKey: string;
  setActiveSearchKey: (value: string) => void;
  searchResult: SearchResult[];
}
