import { SearchResult } from 'bricky/utils/withCommand';
import React from 'react';

export interface AccessoryValues {
  search: string;
  setSearch: (value: string) => void;
  activeSearchKey: string;
  setActiveSearchKey: (value: string) => void;
  searchResult: SearchResult[];
}

const Accessories = React.createContext<AccessoryValues>({
  search: '',
  setSearch: () => void 0,
  activeSearchKey: '',
  setActiveSearchKey: () => void 0,
  searchResult: [],
});

export const AccessoriesProvider = Accessories.Provider;

/**
 * @description 编辑器外围数据，一般用于整体驱动编辑器更新：例如，搜索高亮
 * @export
 * @return {*} AccessoryValues
 */
export function useAccessories() {
  const accessories = React.useContext(Accessories);
  return accessories;
}
