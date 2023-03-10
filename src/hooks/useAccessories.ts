import React from 'react';
import { AccessoryValues } from '../interface';

const Accessories = React.createContext<AccessoryValues>({
  researching: false,
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
 * @return {AccessoryValues}
 */
export function useAccessories() {
  const accessories = React.useContext<AccessoryValues>(Accessories);
  return accessories;
}
