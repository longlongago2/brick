import React from 'react';
import type { BrickySearchValues } from '../../types';

// 创建用于编辑器整体搜索的上下文
const BrickySearchCxt = React.createContext<BrickySearchValues>({
  search: '',
  setSearch: () => void 0,
  activeSearchKey: '',
  setActiveSearchKey: () => void 0,
  searchResult: [],
  setSearchResult: () => void 0,
  reset: () => void 0,
});

export const BrickySearchProvider = BrickySearchCxt.Provider;

export default BrickySearchCxt;
