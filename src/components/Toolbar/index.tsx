import React, { memo, useCallback, useMemo } from 'react';
import { useSlate, ReactEditor } from 'slate-react';
import { Tooltip, Divider, Space } from 'antd';
import {
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
} from '@ant-design/icons';
import { isPowerArray } from '../../utils';
import { LIST_TYPES } from '../../utils/constant';
import Button from './Button';
import Selector from './Select';

import type { Editor } from 'slate';
import type { DropdownOption, SelectProps } from './Select';
import type { ButtonProps } from './Button';

const mp0 = { padding: 0, margin: 0 };

// 普通按钮
export interface ToolbarButton {
  key: string;
  type: 'button';
  icon: React.ReactNode;
  title: React.ReactNode;
  active?: boolean | ((editor: Editor) => boolean);
  onClick?: (editor: Editor, e: any) => void;
}

// 下拉按钮
export interface ToolbarDropdown {
  key: string;
  type: 'dropdown';
  title: React.ReactNode;
  width?: number;
  placeholder?: string;
  optionDisplayField?: keyof DropdownOption;
  options: DropdownOption[];
  activeKey?: DropdownOption['key'] | ((editor: Editor) => DropdownOption['key']);
  onSelect?: (editor: Editor, v: any, option: any) => void;
}

// 自定义按钮
export interface ToolbarElement {
  key: string;
  type: 'custom';
  title: React.ReactNode;
  element: React.ReactElement | ((editor: Editor) => React.ReactElement);
}

// 分割线
export type ToolbarDivider = 'divider';

// Toolbar item
export type ToolbarItem = ToolbarButton | ToolbarDropdown | ToolbarElement | ToolbarDivider;

// Toolbar resolver
export type ToolbarResolver = Exclude<ToolbarItem, ToolbarDivider>;

export interface ToolbarProps {
  className?: string;
  style?: React.CSSProperties;
  sort?: string[]; // 按钮排列顺序
  include?: string[]; // 包含按钮
  exclude?: string[]; // 排除按钮
  extraResolver?: (editor: Editor) => ToolbarResolver[]; // 自定义按钮处理程序
}

export const baseSort = [
  'format',
  'divider',
  'bold',
  'italic',
  'linethrough',
  'underline',
  'divider',
  'align',
  'numbered-list',
  'bulleted-list',
];

export const baseResolver: ToolbarResolver[] = [
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
];

function Toolbar(props: ToolbarProps) {
  const { className, style, sort = baseSort, include, exclude, extraResolver } = props;

  const editor = useSlate();

  const extra = useMemo(() => extraResolver?.(editor) || [], [editor, extraResolver]);

  const getResolver = useCallback(() => {
    let res = baseResolver.filter(({ key }) => !extra.find((_) => _.key === key)).concat(extra);
    if (Array.isArray(include)) {
      res = res.filter(({ key }) => include.includes(key));
    }
    if (exclude && isPowerArray(exclude)) {
      res = res.filter(({ key }) => !exclude.includes(key));
    }
    const resolver = sort
      .map((key) => {
        if (key === 'divider') return 'divider';
        return res.find((item) => item.key === key);
      })
      .filter(Boolean) as ToolbarItem[];
    return resolver;
  }, [exclude, extra, include, sort]);

  const resolver = useMemo(() => getResolver(), [getResolver]);

  const handleButtonClick = useCallback<Exclude<ButtonProps<ToolbarButton>['onClick'], undefined>>(
    (e, dataset) => {
      dataset?.onClick?.(editor, e);
    },
    [editor]
  );

  const handleSelectChange = useCallback<Exclude<SelectProps<ToolbarDropdown>['onChange'], undefined>>(
    (value, option, dataset) => {
      dataset?.onSelect?.(editor, value, option);
    },
    [editor]
  );

  return (
    <Space role="toolbar" className={className} style={style} wrap>
      {resolver.map((item, i) => {
        if (item === 'divider') {
          return <Divider key={`${item}-${i}`} type="vertical" />;
        }
        const { key, type } = item;
        if (type === 'button') {
          // 普通按钮
          let active = false;
          if (typeof item.active === 'boolean') {
            active = item.active;
          } else if (typeof item.active === 'function') {
            active = item.active(editor);
          }
          return (
            <Button<ToolbarButton>
              key={key}
              icon={item.icon}
              title={item.title}
              active={active}
              dataset={item}
              onClick={handleButtonClick}
            />
          );
        }
        if (type === 'dropdown') {
          // 下拉按钮
          let value = '';
          if (typeof item.activeKey === 'string') {
            value = item.activeKey;
          } else if (typeof item.activeKey === 'function') {
            value = item.activeKey(editor);
          }
          return (
            <Selector<ToolbarDropdown>
              key={key}
              value={value}
              options={item.options}
              title={item.title}
              width={item.width}
              placeholder={item.placeholder}
              dataset={item}
              optionDisplayField={item.optionDisplayField}
              onChange={handleSelectChange}
            />
          );
        }
        if (type === 'custom') {
          // 自定义按钮
          let jsxElement = null;
          if (typeof item.element === 'function') {
            jsxElement = item.element(editor);
          } else {
            jsxElement = item.element;
          }
          return (
            <Tooltip key={item.key} title={item.title}>
              {jsxElement}
            </Tooltip>
          );
        }
        return null;
      })}
    </Space>
  );
}

export default memo(Toolbar);
