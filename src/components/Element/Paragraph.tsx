import React, { useCallback, memo, useState, useMemo } from 'react';
import { Editor, Transforms, Path } from 'slate';
import { useSlate, ReactEditor, useReadOnly, useSelected } from 'slate-react';
import { Dropdown, Button } from 'antd';
import {
  DragOutlined,
  EnterOutlined,
  HolderOutlined,
  LoadingOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { useDrag, useDrop } from 'react-dnd';
import classNames from 'classnames';
import useStyled from './styled';

import type { RenderElementProps } from 'slate-react';
import type { ParagraphElement } from 'slate';
import type { DropDownProps } from 'antd';

const trigger: DropDownProps['trigger'] = ['contextMenu'];

interface DragItem extends ParagraphElement {
  id: string;
  path: Path;
}

function Paragraph(props: RenderElementProps) {
  const { attributes, children } = props;

  const element = props.element as ParagraphElement;

  // memorized
  const { paragraphLock, paragraph, dragButton } = useStyled();

  const editor = useSlate();

  const readOnly = useReadOnly();

  const selected = useSelected();

  // draggable
  const [allowDrag, setAllowDrag] = useState(false);

  const [dragDirection, setDragDirection] = useState<'up' | 'down'>('down');

  // 当本组件作为拖动源的行为
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: element.type,
    item: () => {
      // 拖动源附带的数据
      const key = ReactEditor.findKey(editor, element);
      const path = ReactEditor.findPath(editor, element);
      return { id: key.id, path, ...element };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // 当本组件作为拖动放置目标的行为
  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: element.type,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    // 当drag element悬停在组件上时调用
    hover(item: DragItem) {
      const dragPath = item.path;
      const hoverPath = ReactEditor.findPath(editor, element);
      if (Path.isBefore(dragPath, hoverPath)) {
        setDragDirection('down');
      } else {
        setDragDirection('up');
      }
    },
    // 当drag element释放在组件上时
    drop(item: DragItem) {
      const key = ReactEditor.findKey(editor, element);
      const path = ReactEditor.findPath(editor, element);
      const dragId = item.id;
      const dropId = key.id;
      // Don't replace items with themselves
      if (dragId === dropId) return;
      // Avoid locked paragraph
      if (element.lock) return;
      // Move
      Transforms.moveNodes(editor, { at: item.path, to: path });
    },
  });

  // handler
  const getDropRef = (ref: HTMLParagraphElement) => {
    attributes.ref(ref); // 继承 slate attribute 自身的逻辑
    drop(ref);
  };

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
        setAllowDrag(false);
        editor.toggleLock('paragraph');
      } else if (key === 'allow-drag') {
        setAllowDrag(true);
      } else if (key === 'not-allow-drag') {
        setAllowDrag(false);
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
          (allowDrag
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
    [allowDrag, element.lock, handleMenuClick]
  );

  const dragIcon = useMemo(() => (isDragging ? <LoadingOutlined spin /> : <HolderOutlined />), [isDragging]);

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
      <p
        style={style}
        {...attributes}
        ref={getDropRef}
        className={classNames(
          paragraph,
          {
            draggable: allowDrag,
            hovering: canDrop && isOver,
            dragging: isDragging,
          },
          dragDirection
        )}
      >
        {children}
        {allowDrag && !isDragging && (
          <Button ref={drag} icon={dragIcon} size="small" className={dragButton} contentEditable={false}>
            按住拖动
          </Button>
        )}
      </p>
    </Dropdown>
  );
}

export default memo(Paragraph);
