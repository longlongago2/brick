import React, { memo, createContext, useMemo } from 'react';
import { useToolbar } from 'src/hooks';
import type { Toolbar } from 'src/hooks';

export interface ProviderProps {
  toolbar?: React.MutableRefObject<Toolbar>;
  children: React.ReactNode;
}

const defaultValue = {
  current: {
    resolver: [], // baseResolver + extraResolver
    render: '', // jsx element
  },
};

export const ToolbarCtx = createContext<React.MutableRefObject<Toolbar>>(defaultValue);

ToolbarCtx.displayName = 'ToolbarCtx';

function Provider(props: ProviderProps) {
  const { toolbar, children } = props;

  const defaultToolbar = useToolbar();

  const _toolbar = useMemo(() => toolbar || defaultToolbar, [defaultToolbar, toolbar]);

  return <ToolbarCtx.Provider value={_toolbar}>{children}</ToolbarCtx.Provider>;
}

export default memo(Provider);
