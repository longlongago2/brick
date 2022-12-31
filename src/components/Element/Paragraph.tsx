import React, { useCallback, memo, useMemo } from 'react';
import { Editor, Transforms } from 'slate';
import { ReactEditor, useSlate, useReadOnly, useSelected } from 'slate-react';
import { Dropdown } from 'antd';
import { DragOutlined, EnterOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import ParagraphDraggable from './ParagraphDraggable';
import useStyled from './styled';

import type { RenderElementProps } from 'slate-react';
import type { ParagraphElement } from 'slate';
import type { DropDownProps } from 'antd';

const trigger: DropDownProps['trigger'] = ['contextMenu'];

function Paragraph(props: RenderElementProps) {
  const { attributes, children } = props;

  const element = props.element as ParagraphElement;

  // memorized
  const { paragraphLock } = useStyled();

  const editor = useSlate();

  const readOnly = useReadOnly();

  const selected = useSelected();

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

  const handleMenuClick = useCallback<NonNullable<NonNullable<DropDownProps['menu']>['onClick']>>(
    ({ key }) => {
      if (key === 'up-enter') {
        handleUpEnter();
      } else if (key === 'down-enter') {
        handleDownEnter();
      } else if (key.indexOf('lock') > -1) {
        editor.toggleLock('paragraph');
        editor.toggleDraggable('paragraph', { draggable: false });
      } else if (key === 'allow-drag') {
        editor.toggleDraggable('paragraph', { unique: true });
      } else if (key === 'not-allow-drag') {
        editor.toggleDraggable('paragraph', { unique: true });
      }
    },
    [editor, handleDownEnter, handleUpEnter]
  );

  // memorize
  const style = useMemo<React.CSSProperties>(
    () => ({
      textAlign: element.align,
    }),
    [element.align]
  );

  const draggable = useMemo(() => element.draggable, [element.draggable]);

  const menu = useMemo<DropDownProps['menu']>(
    () => ({
      items: [
        element.lock
          ? {
            key: 'unlock',
            label: '解除冻结',
            icon: <UnlockOutlined />,
          }
          : {
            key: 'lock',
            label: '冻结段落',
            icon: <LockOutlined />,
          },
        !element.lock &&
          (draggable
            ? {
              key: 'not-allow-drag',
              label: '关闭段落拖动',
              icon: <DragOutlined />,
            }
            : {
              key: 'allow-drag',
              label: '开启段落拖动',
              icon: <DragOutlined />,
            }),
        {
          key: 'up-enter',
          label: '新增上段落',
          icon: <EnterOutlined style={{ transform: 'rotate(90deg)' }} />,
        },
        {
          key: 'down-enter',
          label: '新增下段落',
          icon: <EnterOutlined />,
        },
      ].filter(Boolean as any as ExcludesFalse),
      onClick: handleMenuClick,
    }),
    [draggable, element.lock, handleMenuClick]
  );

  const core = (
    <p style={style} {...attributes}>
      {children}
    </p>
  );

  // render
  if (readOnly) {
    // 只读状态
    return core;
  }

  if (element.lock) {
    // 冻结状态
    return (
      <Dropdown trigger={trigger} menu={menu}>
        <p
          style={style}
          {...attributes}
          className={paragraphLock}
          title="该段落已冻结，右键可解除"
          contentEditable={!selected}
          suppressContentEditableWarning={true}
        >
          {children}
        </p>
      </Dropdown>
    );
  }

  if (editor.hasDraggableNodes()) {
    // 拖动状态
    return <ParagraphDraggable {...props} trigger={trigger} menu={menu} />;
  }

  // 基础状态
  return (
    <Dropdown trigger={trigger} menu={menu}>
      {core}
    </Dropdown>
  );
}

export default memo(Paragraph);
