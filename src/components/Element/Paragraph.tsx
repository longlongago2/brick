import React, { useCallback, memo, useState, useMemo } from 'react';
import { Editor, Transforms } from 'slate';
import { useSlate, ReactEditor, useReadOnly, useSelected } from 'slate-react';
import { Dropdown, Button } from 'antd';
import { DragOutlined, EnterOutlined, HolderOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import useStyled from './styled';

import type { RenderElementProps } from 'slate-react';
import type { ParagraphElement } from 'slate';
import type { DropDownProps } from 'antd';

const trigger: DropDownProps['trigger'] = ['contextMenu'];

function Paragraph(props: RenderElementProps) {
  const { attributes, children } = props;

  const element = props.element as ParagraphElement;

  // memorized
  const { paragraphLock, paragraph, dragButton } = useStyled();

  const [dragging, setDragging] = useState(false);

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

  const handleMenuClick = useCallback<
    Exclude<Exclude<DropDownProps['menu'], undefined>['onClick'], undefined>
  >(
    ({ key }) => {
      if (key === 'up-enter') {
        handleUpEnter();
      } else if (key === 'down-enter') {
        handleDownEnter();
      } else if (key.indexOf('lock') > -1) {
        setDragging(false);
        editor.toggleLock('paragraph');
      } else if (key === 'allow-drag') {
        setDragging(true);
      } else if (key === 'not-allow-drag') {
        setDragging(false);
      }
    },
    [editor, handleDownEnter, handleUpEnter]
  );

  const style = useMemo<React.CSSProperties>(
    () => ({
      textAlign: element.align,
    }),
    [element.align]
  );

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
          (dragging
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
    [dragging, element.lock, handleMenuClick]
  );

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

  // 可拖动
  return (
    <Dropdown trigger={trigger} menu={menu}>
      <p style={style} {...attributes} className={paragraph} draggable={dragging}>
        {children}
        {dragging && (
          <Button icon={<HolderOutlined />} size="small" className={dragButton} contentEditable={false}>
            按住拖动
          </Button>
        )}
      </p>
    </Dropdown>
  );
}

export default memo(Paragraph);
