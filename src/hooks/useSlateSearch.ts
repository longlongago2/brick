import React from 'react';
import { SlateSearchCxt } from '.';

/**
 * @description 获取编辑器用于驱动搜索的上下文数据
 */
export function useSlateSearch() {
  const slateSearch = React.useContext(SlateSearchCxt);
  return slateSearch;
}
