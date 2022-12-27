import { useContext } from 'react';
import { ToolbarCtx } from 'src/components/Toolbar/Provider';

// 获取当前toolbar的上下文数据
export function useToolbarCtx() {
  const toolbar = useContext(ToolbarCtx);
  return toolbar;
}
