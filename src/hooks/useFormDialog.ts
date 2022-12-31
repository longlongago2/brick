import { useCallback, useState } from 'react';
import { Form } from 'antd';

export interface useFormDialogParams {
  defaultVisible?: boolean;
  defaultLoading?: boolean;
  defaultMode?: 'insert' | 'update';
}

export function useFormDialog(params?: useFormDialogParams) {
  const { defaultVisible, defaultLoading, defaultMode = 'insert' } = params || {};

  const [visible, setVisible] = useState(defaultVisible); // 对话框的显示状态

  const [mode, setMode] = useState<'insert' | 'update'>(defaultMode); // 弹框模式：编辑/更新

  const [loading, setLoading] = useState(defaultLoading); // 对话框loading

  const [pos, setPos] = useState<{ x: number; y: number }>(); // 对话框的拖动位置

  const [form] = Form.useForm();

  const submit = useCallback(() => {
    setLoading(true);
    form.submit();
  }, [form]);

  const reset = useCallback(() => {
    setLoading(defaultLoading);
    setMode(defaultMode);
    form.resetFields();
  }, [defaultLoading, defaultMode, form]);

  const close = useCallback(() => {
    setVisible(false);
    reset();
  }, [reset]);

  return {
    form,
    visible,
    setVisible,
    mode,
    setMode,
    loading,
    setLoading,
    pos,
    setPos,
    close,
    submit,
    reset,
  };
}
