import React, { memo, useMemo } from 'react';
import { Slate } from 'slate-react';
import { ConfigProvider } from 'antd';
import { useEditorState } from '../../hooks';

import type { Descendant, Editor } from 'slate';
import type { ThemeConfig } from 'antd/es/config-provider/context';

export type SlateProviderProps = {
  value: Descendant[];
  children: React.ReactNode;
  editor?: Editor;
  theme?: ThemeConfig;
  onChange?: (value: Descendant[]) => void;
};

function SlateProvider(props: SlateProviderProps) {
  const { editor, value, children, theme, onChange } = props;

  const _editor = useEditorState();

  const editorState = useMemo(() => editor ?? _editor, [_editor, editor]);

  const slate = (
    <Slate editor={editorState} value={value} onChange={onChange}>
      {children}
    </Slate>
  );

  if (theme) {
    return <ConfigProvider theme={theme}>{slate}</ConfigProvider>;
  }

  return slate;
}

export default memo(SlateProvider);
