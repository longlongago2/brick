import { useMemo, useState } from 'react';
import { useSlate, ReactEditor } from 'slate-react';
import { Transforms, Path } from 'slate';
import { theme } from 'antd';
import { css } from '@emotion/css';
import { useDrag, useDrop } from 'react-dnd';
import classNames from 'classnames';
import type { Element } from 'slate';

const { useToken } = theme;

export interface useReactDndParams<T extends Element> {
  element: T;
}

export interface BaseDragItem {
  id: string;
  path: Path;
  [key: string]: any;
}

export function useReactDnd<
  TEle extends Element = Element,
  TDragItem extends BaseDragItem = BaseDragItem & TEle
>(params: useReactDndParams<TEle>) {
  const { element } = params || {};

  // hooks
  const editor = useSlate();

  const { token } = useToken();

  // memoize
  const [dragDirection, setDragDirection] = useState<'up' | 'down'>('down');

  const commonDraggableStyle = useMemo(
    () => css`
      position: relative;
      z-index: 1;
      &.draggable {
        background-color: ${token.colorPrimaryBg};
        box-shadow: 0 0 1px 0 ${token.colorPrimary};
      }
      &.dragging {
        opacity: 0.7;
      }
      &.hovering {
        position: relative;
        &::after {
          position: absolute;
          display: block;
          content: '';
          left: 0;
          width: 100%;
          border-top: 2px dashed ${token.colorBorder};
        }
        &.up {
          &::after {
            top: -7px;
          }
        }
        &.down {
          &::after {
            bottom: -7px;
          }
        }
      }
    `,
    [token]
  );

  // non-memoize
  const eleKey = ReactEditor.findKey(editor, element); // 不能使用useMemo进行memoize，否则会有问题，这里必须实时计算，下同。

  const elePath = ReactEditor.findPath(editor, element);

  let draggable;

  if ('draggable' in element) {
    draggable = element.draggable;
  }

  // draggable
  // 当组件作为拖动源的行为
  const [{ isDragging }, drag] = useDrag<TDragItem, unknown, { isDragging: boolean }>({
    type: element.type,
    item: () => {
      // 拖动源附带的数据
      return { id: eleKey.id, path: elePath, ...element } as TDragItem & TEle;
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // 当组件作为拖动放置目标的行为
  const [{ isOver, canDrop }, drop] = useDrop<TDragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: element.type,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    // 当drag element悬停在组件上时调用
    hover(item: TDragItem) {
      const dragPath = item.path;
      const hoverPath = elePath;
      if (Path.isBefore(dragPath, hoverPath)) {
        setDragDirection('down');
      } else {
        setDragDirection('up');
      }
    },
    // 当drag element释放在组件上时
    drop(item: TDragItem) {
      const dragId = item.id;
      const dropId = eleKey.id;
      // Don't replace items with themselves
      if (dragId === dropId) return;
      // Move
      Transforms.moveNodes(editor, { at: item.path, to: elePath });
    },
  });

  return {
    classes: classNames(
      commonDraggableStyle,
      {
        draggable,
        hovering: canDrop && isOver, // 即虚线框
        dragging: isDragging,
      },
      dragDirection
    ),
    drag,
    drop,
    isDragging,
    isOver,
    canDrop,
  };
}
