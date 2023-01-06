import React, { memo, useMemo } from 'react';
import { Button, Dropdown } from 'antd';
import { useSelected, useFocused } from 'slate-react';
import { HolderOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useReactDnd } from 'src/hooks';
import useStyled from './styled';

import type { RenderElementProps } from 'slate-react';
import type { ParagraphElement } from 'slate';
import type { DropDownProps } from 'antd';

function ParagraphDraggable(props: RenderElementProps & DropDownProps) {
  const { attributes, children, trigger, menu } = props;

  const element = props.element as ParagraphElement;

  // memorized
  const { dragButton, paragraphCore, blockSelected } = useStyled();

  const selected = useSelected();

  const focused = useFocused();

  // draggable
  const { drag, drop, classes, isDragging } = useReactDnd({ element });

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

  // render
  return (
    <Dropdown trigger={trigger} menu={menu}>
      <p
        style={style}
        {...attributes}
        ref={getDropRef}
        className={classNames(
          paragraphCore,
          {
            [blockSelected]: selected,
            [`${blockSelected}--blur`]: selected && !focused,
          },
          classes
        )}
      >
        {children}
        {element.draggable && !isDragging && (
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
