import React, { memo } from 'react';
import BrickyProvider from '../BrickyProvider';
import Toolbar from '../Toolbar';
import Content from '../Content';

import type { Descendant, Editor as SlateEditor } from 'slate';
import type { ThemeConfig } from 'antd/es/config-provider/context';
import type { ContentProps } from '../Content';
import type { ToolbarProps } from '../Toolbar';

export interface EditorProps
  extends Omit<ContentProps, 'style' | 'className'>,
    Omit<ToolbarProps, 'style' | 'className'> {
  editor?: SlateEditor;
  defaultValue: Descendant[];
  onChange?: (value: Descendant[]) => void;
  theme?: ThemeConfig;
  className?: string;
  contentStyle?: React.CSSProperties;
  contentClassName?: string;
  toolbarStyle?: React.CSSProperties;
  toolbarClassName?: string;
}

/**
 * @description Editor, 包含toolbar工具栏和content编辑区
 * @param {EditorProps} props
 * @return {*}
 */
function Editor(props: EditorProps) {
  const {
    defaultValue,
    editor,
    theme,
    className,
    contentStyle,
    contentClassName,
    toolbarClassName,
    toolbarStyle,
    placeholder,
    spellCheck,
    autoFocus,
    readOnly,
    include,
    exclude,
    sort,
    extraResolver,
    renderElement,
    fileUpload,
    renderLeaf,
    onKeyboard,
    onChange,
  } = props;

  return (
    <BrickyProvider editor={editor} defaultValue={defaultValue} onChange={onChange} theme={theme}>
      <div className={className}>
        <Toolbar
          className={toolbarClassName}
          style={toolbarStyle}
          sort={sort}
          include={include}
          exclude={exclude}
          extraResolver={extraResolver}
          fileUpload={fileUpload}
        />
        <Content
          className={contentClassName}
          style={contentStyle}
          placeholder={placeholder}
          spellCheck={spellCheck}
          autoFocus={autoFocus}
          readOnly={readOnly}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyboard={onKeyboard}
        />
      </div>
    </BrickyProvider>
  );
}

export default memo(Editor);
