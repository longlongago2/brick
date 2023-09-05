import React, { memo, useMemo } from 'react';
import { Slate } from 'slate-react';
import { ConfigProvider } from 'antd';
import { useBrickyEditor, SlateSearchProvider, useCreateSearch } from '../../hooks';
import type { Descendant, Editor } from 'slate';
import type { ThemeConfig } from 'antd/es/config-provider/context';

export interface BrickyProviderProps {
  initialValue: Descendant[];
  children: React.ReactNode;
  editor?: Editor;
  theme?: ThemeConfig;
  onChange?: (value: Descendant[]) => void;
}

function BrickyProvider(props: BrickyProviderProps) {
  const { editor, initialValue, children, theme, onChange } = props;

  const _editor = useBrickyEditor();

  const bricky = useMemo(() => editor ?? _editor, [_editor, editor]);

  const slateSearch = useCreateSearch(bricky);

  // Render
  // Slate Provider's "value" prop is only used as initial state for editor.children.
  // If your code relies on replacing editor.children
  // you should do so by replacing it directly instead of relying on the "value" prop to do this for you.
  // See Slate PR 4540 for a more in-depth discussion.
  // https://github.com/ianstormtaylor/slate/pull/4540
  // SlateSearchProvider depends on Slate's editor, so it needs to be placed in Slate.
  const slate = (
    <Slate editor={bricky} initialValue={initialValue} onChange={onChange}>
      <SlateSearchProvider value={slateSearch}>{children}</SlateSearchProvider>
    </Slate>
  );

  // Theme: lazy extends antd theme
  if (theme) {
    return <ConfigProvider theme={theme}>{slate}</ConfigProvider>;
  }

  return slate;
}

export default memo(BrickyProvider);
