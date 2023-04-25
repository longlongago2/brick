import React from 'react';
import { BrickySearchValues } from '../types';
import BrickySearchCxt from '../components/BrickyProvider/SearchCtx';


/**
 * @description 获取编辑器用于驱动搜索的全局数据
 */
export function useBrickySearch() {
  const brickySearch = React.useContext<BrickySearchValues>(BrickySearchCxt);
  return brickySearch;
}
