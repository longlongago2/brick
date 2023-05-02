import React from 'react';
import type { SlateSearch } from '.';
import type { AdvancedHighlight } from 'slate';

const defaultValue: SlateSearch = {
  setKeyword: () => void 0,
  setActiveKey: () => void 0,
  reset: () => void 0,
  getState: () => ({ keyword: '', activeKey: '', results: [] }),
  forceCollectSearchResult: () => void 0,
  createSearchMark: () => ({ highlight: {} as AdvancedHighlight }),
};

const SlateSearchCxt = React.createContext(defaultValue);

/**
 * @description 编辑器用于驱动搜索的全局数据提供者
 */
export const SlateSearchProvider = SlateSearchCxt.Provider;

/**
 * @description 获取编辑器用于驱动搜索的上下文数据
 */
export function useSlateSearch() {
  const slateSearch = React.useContext(SlateSearchCxt);
  return slateSearch;
}
