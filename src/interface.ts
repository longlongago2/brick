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
 * @description 编辑器装饰器参数类型
 */
export interface EditorDecorate {
  search: string;
}


/**
 * @description 编辑器外围全局数据类型
 */
export interface BrickySearchValues {
  search: string; // 搜索关键字
  setSearch: (value: string) => void;
  activeSearchKey: string; // 搜索结果高亮key
  setActiveSearchKey: (value: string) => void;
  searchResult: SearchResult[]; // 搜索结果
  setSearchResult: (value: SearchResult[]) => void;
  reset: () => void;
}
