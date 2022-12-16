import React, { memo, useCallback, useMemo } from 'react';
import { useSlate, ReactEditor } from 'slate-react';
import Tooltip from '@mui/joy/Tooltip';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import { isPowerArray } from '../../utils';
import { ToolbarStyled, DividerStyled } from './styled';
import Button from './Button';
import Selector, { DropdownOption, BaseSelector } from './Selector';

import type { Editor } from 'slate';

// 普通按钮
export type ToolbarButton = {
  key: string;
  type: 'button';
  icon: React.ReactNode;
  title: React.ReactNode;
  active?: boolean | ((editor: Editor) => boolean);
  onClick?: (editor: Editor, e: any) => void;
};

// 下拉按钮
export type ToolbarDropdown = {
  key: string;
  type: 'dropdown';
  title: React.ReactNode;
  width?: number;
  placeholder?: string;
  options: DropdownOption[];
  activeKey?: DropdownOption['key'] | ((editor: Editor) => DropdownOption['key']);
  onSelect?: (editor: Editor, e: any, v: any) => void;
};

// 自定义按钮
export type ToolbarElement = {
  key: string;
  type: 'custom';
  title: React.ReactNode;
  element: React.ReactElement | ((editor: Editor) => React.ReactElement);
};

// 分割线
export type ToolbarDivider = 'divider';

// ToolbarItem
export type ToolbarItem = ToolbarButton | ToolbarDropdown | ToolbarElement | ToolbarDivider;

export type ToolbarResolver = Exclude<ToolbarItem, ToolbarDivider>;

export interface ToolbarProps {
  className?: string;
  style?: React.CSSProperties;
  sort?: string[]; // 按钮排列顺序
  include?: string[]; // 包含按钮
  exclude?: string[]; // 排除按钮
  extraResolver?: (editor: Editor) => ToolbarResolver[]; // 自定义按钮处理程序
}

const nmpStyle = { padding: 0, margin: 0 };

export const baseSort = ['format', 'divider', 'bold', 'italic', 'linethrough', 'underline', 'divider'];

export const baseResolver: ToolbarResolver[] = [
  {
    key: 'bold',
    type: 'button',
    icon: <FormatBoldIcon />,
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
    icon: <FormatItalicIcon />,
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
    icon: <StrikethroughSIcon />,
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
    icon: <FormatUnderlinedIcon />,
    title: '下划线 Ctrl+U',
    active: (editor) => editor.isMarkActive('underline'),
    onClick(editor) {
      editor.toggleMark('underline');
      ReactEditor.focus(editor);
    },
  },
  {
    key: 'format',
    type: 'dropdown',
    title: '正文与标题',
    width: 90,
    placeholder: '无标题',
    options: [
      {
        key: 'paragraph',
        label: '正文',
        title: <p style={nmpStyle}>正文</p>,
        extra: 'Ctrl+Alt+0',
      },
      {
        key: 'heading-one',
        label: '标题1',
        title: <h1 style={nmpStyle}>标题1</h1>,
        extra: 'Ctrl+Alt+1',
      },
      {
        key: 'heading-two',
        label: '标题2',
        title: <h2 style={nmpStyle}>标题2</h2>,
        extra: 'Ctrl+Alt+2',
      },
      {
        key: 'heading-three',
        label: '标题3',
        title: <h3 style={nmpStyle}>标题3</h3>,
        extra: 'Ctrl+Alt+3',
      },
      {
        key: 'heading-four',
        label: '标题4',
        title: <h4 style={nmpStyle}>标题4</h4>,
        extra: 'Ctrl+Alt+4',
      },
      {
        key: 'heading-five',
        label: '标题5',
        title: <h5 style={nmpStyle}>标题5</h5>,
        extra: 'Ctrl+Alt+5',
      },
      {
        key: 'heading-six',
        label: '标题6',
        title: <h6 style={nmpStyle}>标题6</h6>,
        extra: 'Ctrl+Alt+6',
      },
    ],
    activeKey: (editor) => editor.getElementValue('type'),
    onSelect(editor, e, v) {
      editor.toggleElement(v);
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

  const handleButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, dataset: ToolbarButton) => {
      if (dataset?.onClick) dataset?.onClick(editor, e);
    },
    [editor]
  );

  const handleSelectChange = useCallback<Exclude<BaseSelector<ToolbarDropdown>['onChange'], undefined>>(
    (e, v, dataset) => {
      if (dataset?.onSelect) dataset.onSelect(editor, e, v);
    },
    [editor]
  );

  return (
    <ToolbarStyled role="toolbar" className={className} style={style}>
      {resolver.map((item, i) => {
        if (item === 'divider') {
          return <DividerStyled key={`${item}-${i}`} />;
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
            <Button key={key} onClick={handleButtonClick} active={active} title={item.title} dataset={item}>
              {item.icon}
            </Button>
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
            <Selector
              key={key}
              value={value}
              options={item.options}
              title={item.title}
              width={item.width}
              placeholder={item.placeholder}
              dataset={item}
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
            <Tooltip key={item.key} title={item.title} size="sm">
              {jsxElement}
            </Tooltip>
          );
        }
        return null;
      })}
    </ToolbarStyled>
  );
}

export default memo(Toolbar);
