import React, { memo, useCallback, useMemo } from 'react';
import { Slate } from 'slate-react';
import { ConfigProvider } from 'antd';
import { useBrickyEditor } from '../../hooks';
import { BrickySearchProvider } from './SearchCtx';
import useCreateSearch from './useCreateSearch';

import type { Descendant, Editor } from 'slate';
import type { ThemeConfig } from 'antd/es/config-provider/context';

export interface BrickyProviderProps {
  value: Descendant[];
  children: React.ReactNode;
  editor?: Editor;
  theme?: ThemeConfig;
  onChange?: (value: Descendant[]) => void;
}

function BrickyProvider(props: BrickyProviderProps) {
  const { editor, value, children, theme, onChange } = props;

  const _editor = useBrickyEditor();

  const bricky = useMemo(() => editor ?? _editor, [_editor, editor]);

  const { brickySearchValues, updateSearchResult } = useCreateSearch(() => bricky);

  const handleChange = useCallback(
    (value: Descendant[]) => {
      onChange?.(value);
      // 当文章内容改变，需要被动更新search result上下文数据
      updateSearchResult();
    },
    [onChange, updateSearchResult]
  );

  // Render
  const slate = (
    <Slate editor={bricky} value={value} onChange={handleChange}>
      <BrickySearchProvider value={brickySearchValues}>{children}</BrickySearchProvider>
    </Slate>
  );

  // Theme: lazy extends antd theme
  if (theme) {
    return <ConfigProvider theme={theme}>{slate}</ConfigProvider>;
  }

  return slate;
}

export default memo(BrickyProvider);
