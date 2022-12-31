import React, { useCallback, useMemo } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import Icon, {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  AlignCenterOutlined,
  MenuOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';
import { Form, Input } from 'antd';
import { useFormDialog } from 'src/hooks';
import { LIST_TYPES } from 'src/utils/constant';
import FormDialog from './FormDialog';
import CodeSvgr from 'src/assets/code.svg';
import BlockQuoteSvgr from 'src/assets/block-quote.svg';
import SuperscriptSvgr from 'src/assets/superscript.svg';
import SubscriptSvgr from 'src/assets/subscript.svg';

import type { ToolbarResolver } from '.';
import type { FormDialogProps } from './FormDialog';

const mp0 = { padding: 0, margin: 0 };

export default function useBaseResolver() {
  const editor = useSlate();

  const {
    form: formLink,
    visible: linkDialogVisible,
    setVisible: setLinkDialogVisible,
    pos: linkDialogPos,
    setPos: setLinkDialogPos,
    close: closeLink,
    submit: submitLink,
  } = useFormDialog();

  const handleLinkFinish = useCallback<NonNullable<FormDialogProps['onFinish']>>(
    (values) => {
      const { url } = values;
      editor.setLink(url);
      ReactEditor.focus(editor);
      closeLink();
    },
    [closeLink, editor]
  );

  const baseResolver = useMemo<ToolbarResolver[]>(
    () => [
      {
        key: 'bold',
        type: 'button',
        icon: <BoldOutlined />,
        title: '加粗 Ctrl+B',
        active: (editor) => editor.isMarkActive('bold'),
        onClick(editor) {
          editor.toggleMark('bold');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'italic',
        type: 'button',
        icon: <ItalicOutlined />,
        title: '倾斜 Ctrl+I',
        active: (editor) => editor.isMarkActive('italic'),
        onClick(editor) {
          editor.toggleMark('italic');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'linethrough',
        type: 'button',
        icon: <StrikethroughOutlined />,
        title: '删除线 Ctrl+Alt+S',
        active: (editor) => editor.isMarkActive('linethrough'),
        onClick(editor) {
          editor.toggleMark('linethrough');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'code',
        type: 'button',
        icon: <Icon component={CodeSvgr} />,
        title: '行内代码 Ctrl+`',
        active: (editor) => editor.isMarkActive('code'),
        onClick(editor) {
          editor.toggleMark('code');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'underline',
        type: 'button',
        icon: <UnderlineOutlined />,
        title: '下划线 Ctrl+U',
        active: (editor) => editor.isMarkActive('underline'),
        onClick(editor) {
          editor.toggleMark('underline');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'superscript',
        type: 'button',
        icon: <Icon component={SuperscriptSvgr} />,
        title: '上标 Ctrl+.',
        active: (editor) => editor.isMarkActive('superscript'),
        onClick(editor) {
          editor.toggleMark('superscript');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'subscript',
        type: 'button',
        icon: <Icon component={SubscriptSvgr} />,
        title: '下标 Ctrl+,',
        active: (editor) => editor.isMarkActive('subscript'),
        onClick(editor) {
          editor.toggleMark('subscript');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'numbered-list',
        type: 'button',
        icon: <OrderedListOutlined />,
        title: '有序列表 Ctrl+Alt+O',
        active: (editor) => editor.isElementActive('numbered-list'),
        onClick(editor) {
          editor.toggleElement('numbered-list');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'bulleted-list',
        type: 'button',
        icon: <UnorderedListOutlined />,
        title: '无序列表 Ctrl+Alt+U',
        active: (editor) => editor.isElementActive('bulleted-list'),
        onClick(editor) {
          editor.toggleElement('bulleted-list');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'block-quote',
        type: 'button',
        icon: <Icon component={BlockQuoteSvgr} />,
        title: '引用块 Ctrl+Alt+Q',
        active: (editor) => editor.isElementActive('block-quote'),
        onClick(editor) {
          editor.toggleElement('block-quote');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'link',
        type: 'button',
        icon: (editor) => (editor.isElementActive('link') ? <DisconnectOutlined /> : <LinkOutlined />),
        title: (editor) => (editor.isElementActive('link') ? '取消超链接' : '插入超链接'),
        active: (editor) => editor.isElementActive('link'),
        attachRender: (
          <FormDialog
            form={formLink}
            width={355}
            draggable
            title="超链接"
            mask={false}
            open={linkDialogVisible}
            defaultPosition={linkDialogPos}
            onCancel={closeLink}
            onOk={submitLink}
            onFinish={handleLinkFinish}
          >
            <Form.Item name="url">
              <Input placeholder="请输入地址，例如：http://www.baidu.com" allowClear />
            </Form.Item>
          </FormDialog>
        ),
        onClick(editor, e) {
          // 处理特殊请求，一般从Content：即文本编辑区中发出
          if (e?.target === 'emitter_edit') {
            // 编辑请求
            const url = editor.getElementFieldsValue('url', 'link');
            const pos = editor.getBoundingClientRect();
            formLink.setFieldsValue({ url });
            if (pos) setLinkDialogPos({ x: pos.x + pos.width, y: pos.y + pos.height });
            setLinkDialogVisible(true);
            return;
          }
          const isActive = editor.isElementActive('link');
          if (isActive) {
            editor.unsetLink();
          } else {
            const pos = editor.getBoundingClientRect();
            if (pos) {
              setLinkDialogPos({ x: pos.x + pos.width, y: pos.y + pos.height });
              setLinkDialogVisible(true);
            }
          }
        },
      },
      {
        key: 'format',
        type: 'dropdown',
        title: '正文与标题',
        placeholder: '无标题',
        width: 85,
        options: [
          {
            key: 'paragraph',
            label: '正文',
            renderLabel: (label) => <p style={mp0}>{label}</p>,
            extra: 'Ctrl+Alt+0',
          },
          {
            key: 'heading-one',
            label: '标题1',
            renderLabel: (label) => <h1 style={mp0}>{label}</h1>,
            extra: 'Ctrl+Alt+1',
          },
          {
            key: 'heading-two',
            label: '标题2',
            renderLabel: (label) => <h2 style={mp0}>{label}</h2>,
            extra: 'Ctrl+Alt+2',
          },
          {
            key: 'heading-three',
            label: '标题3',
            renderLabel: (label) => <h3 style={mp0}>{label}</h3>,
            extra: 'Ctrl+Alt+3',
          },
          {
            key: 'heading-four',
            label: '标题4',
            renderLabel: (label) => <h4 style={mp0}>{label}</h4>,
            extra: 'Ctrl+Alt+4',
          },
          {
            key: 'heading-five',
            label: '标题5',
            renderLabel: (label) => <h5 style={mp0}>{label}</h5>,
            extra: 'Ctrl+Alt+5',
          },
          {
            key: 'heading-six',
            label: '标题6',
            renderLabel: (label) => <h6 style={mp0}>{label}</h6>,
            extra: 'Ctrl+Alt+6',
          },
        ],
        activeKey: (editor) => editor.getElementFieldsValue('type'),
        onSelect(editor, v) {
          editor.toggleElement(v);
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'align',
        type: 'dropdown',
        title: '文本对齐',
        width: 65,
        optionDisplayField: 'icon',
        options: [
          {
            key: 'left',
            label: '左对齐',
            extra: 'Ctrl+Alt+L',
            icon: <AlignLeftOutlined />,
          },
          {
            key: 'right',
            label: '右对齐',
            extra: 'Ctrl+Alt+R',
            icon: <AlignRightOutlined />,
          },
          {
            key: 'center',
            label: '居中对齐',
            extra: 'Ctrl+Alt+C',
            icon: <AlignCenterOutlined />,
          },
          {
            key: 'justify',
            label: '两端对齐',
            extra: 'Ctrl+Alt+J',
            icon: <MenuOutlined />,
          },
        ],
        activeKey: (editor) => {
          const type = editor.getElementFieldsValue('type');
          const isList = LIST_TYPES.includes(type);
          if (isList) {
            // list比较特殊，因为有list-item，此判断逻辑适用于所有存在item的Node，
            // 所以需要注意可能有其他类型的嵌套，需要一并添加判断。
            // getElementFieldsValue 直接获取的是list的值，但其实真正控制align的是list-item
            // 需要指定具体类型，否则获取的是上层的数据
            return editor.getElementFieldsValue('align', 'list-item') || 'left';
          }
          return editor.getElementFieldsValue('align') || 'left';
        },
        onSelect(editor, v) {
          editor.toggleAlign(v);
          ReactEditor.focus(editor);
        },
      },
    ],
    [
      closeLink,
      formLink,
      handleLinkFinish,
      linkDialogPos,
      linkDialogVisible,
      setLinkDialogPos,
      setLinkDialogVisible,
      submitLink,
    ]
  );

  return baseResolver;
}
