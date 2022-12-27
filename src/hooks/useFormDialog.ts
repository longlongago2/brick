import { useCallback, useState } from 'react';
import { Form } from 'antd';

export interface useFormDialogParams {
  defaultVisible?: boolean;
  defaultLoading?: boolean;
  defaultPos?: { x: number; y: number };
}

export function useFormDialog(params?: useFormDialogParams) {
  const { defaultVisible, defaultLoading, defaultPos = { x: 0, y: 0 } } = params || {};

  const [visible, setVisible] = useState(defaultVisible); // 对话框的显示状态

  const [loading, setLoading] = useState(defaultLoading); // 对话框loading

  const [pos, setPos] = useState(defaultPos); // 对话框的拖动位置

  const [form] = Form.useForm();

  const close = useCallback(() => {
    setLoading(false);
    setVisible(false);
    form.resetFields();
  }, [form]);

  const submit = useCallback(() => {
    setLoading(true);
    form.submit();
  }, [form]);

  const reset = useCallback(() => {
    form.resetFields();
  }, [form]);

  return {
    form,
    visible,
    setVisible,
    loading,
    setLoading,
    pos,
    setPos,
    close,
    submit,
    reset,
  };
}
