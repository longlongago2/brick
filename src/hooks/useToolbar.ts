import React, { useRef } from 'react';
import useBaseResolver from 'src/components/Toolbar/useBaseResolver';

import type { ToolbarResolver } from 'src/components/Toolbar';

export interface Toolbar {
  resolver: ToolbarResolver[];
  render: React.ReactNode;
}

// 创建toolbar的上下文数据
export function useToolbar() {
  const { baseRender, baseResolver } = useBaseResolver();

  const toolbar = useRef<Toolbar>({
    resolver: baseResolver, // baseResolver
    render: baseRender,
  });

  return toolbar;
}
