import React, { memo } from 'react';
import SlateProvider from '../SlateProvider';
import Toolbar from '../Toolbar';
import Content from '../Content';

import type { Descendant, Editor } from 'slate';
import type { ThemeConfig } from 'antd/es/config-provider/context';
import type { ContentProps } from '../Content';
import type { ToolbarProps } from '../Toolbar';

export type BaseArchEditorProps = {
  editor?: Editor;
  value: Descendant[];
  onChange?: (value: Descendant[]) => void;
  theme?: ThemeConfig;
  contentStyle?: React.CSSProperties;
  contentClassName?: string;
  toolbarStyle?: React.CSSProperties;
  toolbarClassName?: string;
};

export type ArchEditorProps = BaseArchEditorProps & Omit<ContentProps, 'style'> & Omit<ToolbarProps, 'style'>;

/**
 * @description 完整的Editor, 包含toolbar工具栏和editor编辑器的成品
 * @param {ArchEditorProps} props
 * @return {*}
 */
function ArchEditor(props: ArchEditorProps) {
  const {
    editor,
    value,
    onChange,
    theme,
    className,
    contentClassName,
    contentStyle,
    toolbarClassName,
    toolbarStyle,
    placeholder,
    spellCheck,
    autoFocus,
    readOnly,
    renderElement,
    renderLeaf,
    onKeyboard,
  } = props;

  return (
    <SlateProvider editor={editor} value={value} onChange={onChange} theme={theme}>
      <div className={className}>
        <Toolbar className={toolbarClassName} style={toolbarStyle} />
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
    </SlateProvider>
  );
}

export default memo(ArchEditor);
