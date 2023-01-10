import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Form, FormProps, Modal } from 'antd';
import Draggable from 'react-draggable';
import classNames from 'classnames';
import useStyled from './styled';

import type { DraggableProps, DraggableData, DraggableEvent } from 'react-draggable';
import type { ModalProps, FormInstance } from 'antd';

export interface FormDialogProps extends Omit<ModalProps, 'modalRender' | 'destroyOnClose'> {
  form?: FormInstance;
  defaultPosition?: DraggableProps['defaultPosition'];
  position?: DraggableProps['position'];
  draggable?: boolean;
  layout?: FormProps['layout'];
  labelCol?: FormProps['labelCol'];
  wrapperCol?: FormProps['wrapperCol'];
  onFinish?: FormProps['onFinish'];
  onFinishFailed?: FormProps['onFinishFailed'];
  onFieldsChange?: FormProps['onFieldsChange'];
  onValuesChange?: FormProps['onValuesChange'];
}

function FormDialog(props: FormDialogProps) {
  const {
    title,
    form,
    defaultPosition,
    position,
    draggable,
    layout = 'vertical',
    labelCol,
    wrapperCol,
    wrapClassName,
    children,
    onFinish,
    onFinishFailed,
    onFieldsChange,
    onValuesChange,
    ...restProps
  } = props;

  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });

  const draggleRef = useRef<HTMLDivElement>(null);

  const { dragHandler, dragModal } = useStyled();

  const handleDragStart = useCallback((_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) return;
    // 设置拖动边界
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  }, []);

  const modalRender = useCallback<NonNullable<ModalProps['modalRender']>>(
    (modal) => {
      return (
        <Draggable
          handle={`.${dragHandler}`}
          defaultPosition={defaultPosition}
          position={position}
          bounds={bounds}
          disabled={!draggable}
          onStart={handleDragStart}
        >
          <div ref={draggleRef} role="dialog">
            {modal}
          </div>
        </Draggable>
      );
    },
    [bounds, defaultPosition, dragHandler, draggable, handleDragStart, position]
  );

  const _title = useMemo(
    () => <div className={classNames(dragHandler, { disabled: !draggable })}>{title}</div>,
    [dragHandler, draggable, title]
  );

  return (
    <Modal
      cancelText="取消"
      okText="确定"
      {...restProps}
      title={_title}
      wrapClassName={classNames([(position || defaultPosition) && dragModal, wrapClassName].filter(Boolean))}
      modalRender={modalRender}
      destroyOnClose
    >
      <Form
        form={form}
        layout={layout}
        labelCol={labelCol}
        wrapperCol={wrapperCol}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        onFieldsChange={onFieldsChange}
        onValuesChange={onValuesChange}
      >
        {children}
      </Form>
    </Modal>
  );
}

export default memo(FormDialog);
