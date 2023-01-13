import React, { memo, useCallback, useMemo } from 'react';
import { Slate } from 'slate-react';
import { ConfigProvider } from 'antd';
import { useBrickyEditor } from '../../hooks';
import { AccessoriesProvider } from '../../hooks/useAccessories';
import useAccessories from './useAccessories';

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

  // editor
  const _editor = useBrickyEditor();

  const bricky = useMemo(() => editor ?? _editor, [_editor, editor]);

  const { accessories, update } = useAccessories(() => bricky);

  const handleChange = useCallback((value: Descendant[]) => {
    onChange?.(value);
    update();
  }, [onChange, update]);

  // render
  const slate = (
    <Slate editor={bricky} value={value} onChange={handleChange}>
      <AccessoriesProvider value={accessories}>{children}</AccessoriesProvider>
    </Slate>
  );

  if (theme) {
    return <ConfigProvider theme={theme}>{slate}</ConfigProvider>;
  }

  return slate;
}

export default memo(BrickyProvider);
