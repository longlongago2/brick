import React, { memo, useState, useMemo } from 'react';
import { Transforms, Path } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { Button, Dropdown } from 'antd';
import { HolderOutlined } from '@ant-design/icons';
import { useDrag, useDrop } from 'react-dnd';
import classNames from 'classnames';
import useStyled from './styled';

import type { RenderElementProps } from 'slate-react';
import type { ParagraphElement } from 'slate';
import type { DropDownProps } from 'antd';

interface DragItem extends ParagraphElement {
  id: string;
  path: Path;
}

function ParagraphDraggable(props: RenderElementProps & DropDownProps) {
  const { attributes, children, trigger, menu } = props;

  const element = props.element as ParagraphElement;

  // memorized
  const { paragraphDraggable, dragButton } = useStyled();

  const editor = useSlate();

  // draggable
  const [dragDirection, setDragDirection] = useState<'up' | 'down'>('down');

  const eleKey = ReactEditor.findKey(editor, element);

  const elePath = ReactEditor.findPath(editor, element);

  // 当本组件作为拖动源的行为
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: element.type,
    item: () => {
      // 拖动源附带的数据
      return { id: eleKey.id, path: elePath, ...element };
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
      const hoverPath = elePath;
      if (Path.isBefore(dragPath, hoverPath)) {
        setDragDirection('down');
      } else {
        setDragDirection('up');
      }
    },
    // 当drag element释放在组件上时
    drop(item: DragItem) {
      const dragId = item.id;
      const dropId = eleKey.id;
      // Don't replace items with themselves
      if (dragId === dropId) return;
      // Avoid locked paragraph
      if (element.lock) return;
      // Move
      Transforms.moveNodes(editor, { at: item.path, to: elePath });
    },
  });

  // handler
  const getDropRef = (ref: HTMLParagraphElement) => {
    attributes.ref(ref); // 继承 slate attribute 自身的逻辑
    drop(ref);
  };

  // memorize
  const style = useMemo<React.CSSProperties>(
    () => ({
      textAlign: element.align,
    }),
    [element.align]
  );

  const draggable = useMemo(() => element.draggable, [element.draggable]);

  // render
  return (
    <Dropdown trigger={trigger} menu={menu}>
      <p
        style={style}
        {...attributes}
        ref={getDropRef}
        className={classNames(
          paragraphDraggable,
          {
            draggable,
            hovering: canDrop && isOver,
            dragging: isDragging,
          },
          dragDirection
        )}
      >
        {children}
        {draggable && !isDragging && (
          <Button
            ref={drag}
            icon={<HolderOutlined />}
            size="small"
            className={dragButton}
            contentEditable={false}
          >
            按住拖动
          </Button>
        )}
      </p>
    </Dropdown>
  );
}

export default memo(ParagraphDraggable);
