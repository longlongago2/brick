import React, { useCallback, memo, useState, useMemo } from 'react';
import { Editor, Transforms } from 'slate';
import { useSlate, ReactEditor, useReadOnly } from 'slate-react';
// import ContextMenu from '../ContextMenu'; // 右键菜单

import type { RenderElementProps } from 'slate-react';
import type { ParagraphElement } from 'slate';

function Paragraph(props: RenderElementProps) {
  const { attributes, children } = props;

  const element = props.element as ParagraphElement;

  // memorized
  const [dragging, setDragging] = useState(false);

  const editor = useSlate();

  const readOnly = useReadOnly();

  const style = useMemo<React.CSSProperties>(
    () => ({
      textAlign: element.align,
    }),
    [element.align]
  );

  // handler
  const handleUpEnter = useCallback(() => {
    const paragraph: ParagraphElement = {
      type: 'paragraph',
      children: [{ text: '' }],
    };
    ReactEditor.focus(editor);
    const path = ReactEditor.findPath(editor, element);
    Transforms.insertNodes(editor, paragraph, { at: Editor.start(editor, path), select: true });
  }, [editor, element]);

  const handleDownEnter = useCallback(() => {
    const paragraph: ParagraphElement = {
      type: 'paragraph',
      children: [{ text: '' }],
    };
    ReactEditor.focus(editor);
    const path = ReactEditor.findPath(editor, element);
    Transforms.insertNodes(editor, paragraph, { at: Editor.end(editor, path), select: true });
  }, [editor, element]);

  // lifecycle

  // render
  if (readOnly) {
    // 只读
    return (
      <p style={style} {...attributes}>
        {children}
      </p>
    );
  }

  if (element.lock) {
    // 冻结锁定
    return (
      <p style={style} {...attributes} title="段落已冻结" contentEditable={false}>
        {children}
        {/* 也参考雨雀，开发左侧按钮，显示为拖动手柄或状态指示，右键为菜单，开发为通用的按钮菜单，其他Element 类型也可用 */}
        {/* <div>
          <button onClick={handleUpEnter}>增加上段落</button>
          <button onClick={handleDownEnter}>增加下段落</button>
        </div> */}
      </p>
    );
  }

  // 可拖动
  return (
    <p style={style} {...attributes} draggable={dragging}>
      {children}
    </p>
  );
}

export default memo(Paragraph);
