import React, { memo, useCallback, useMemo } from 'react';
import { Slate } from 'slate-react';
import { ConfigProvider } from 'antd';
import { useBrickyEditor, useNextTick } from '../../hooks';
import { BrickySearchProvider } from './SearchCtx';
import useCreateSearch from './useCreateSearch';

import type { Descendant, Editor } from 'slate';
import type { ThemeConfig } from 'antd/es/config-provider/context';

export interface BrickyProviderProps {
  defaultValue: Descendant[];
  children: React.ReactNode;
  editor?: Editor;
  theme?: ThemeConfig;
  onChange?: (value: Descendant[]) => void;
}

function BrickyProvider(props: BrickyProviderProps) {
  const { editor, defaultValue, children, theme, onChange } = props;

  const nextTick = useNextTick();

  const _editor = useBrickyEditor();

  const bricky = useMemo(() => editor ?? _editor, [_editor, editor]);

  const { brickySearchValues, updateSearchResult } = useCreateSearch(() => bricky);

  const handleChange = useCallback(
    (value: Descendant[]) => {
      onChange?.(value);
      // 当文章内容改变，需要被动更新search result 上下文数据
      // 利用 nextTick，保证在 onChange DOM 渲染完成之后执行
      nextTick(() => updateSearchResult());
    },
    [nextTick, onChange, updateSearchResult]
  );

  // Render
  // Slate Provider's "value" prop is only used as initial state for editor.children.
  // If your code relies on replacing editor.children
  // you should do so by replacing it directly instead of relying on the "value" prop to do this for you.
  // See Slate PR 4540 for a more in-depth discussion.
  // https://github.com/ianstormtaylor/slate/pull/4540
  const slate = (
    <Slate editor={bricky} value={defaultValue} onChange={handleChange}>
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
