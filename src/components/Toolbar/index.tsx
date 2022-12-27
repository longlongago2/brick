import React, { memo, useCallback, useMemo } from 'react';
import { useSlate } from 'slate-react';
import { Tooltip, Divider, Space } from 'antd';
import { isFunction, isPowerArray } from '../../utils';
import Button from './Button';
import Selector from './Select';
import useBaseResolver from './useBaseResolver';
import { useToolbarCtx } from 'src/hooks';

import type { Editor } from 'slate';
import type { DropdownOption, SelectProps } from './Select';
import type { ButtonProps } from './Button';

// 普通按钮
export interface ToolbarButton {
  key: string;
  type: 'button';
  icon: React.ReactNode | ((editor: Editor) => React.ReactNode);
  title: React.ReactNode | ((editor: Editor) => React.ReactNode);
  active?: boolean | ((editor: Editor) => boolean);
  onClick?: (editor: Editor, e: any) => void;
}

// 下拉按钮
export interface ToolbarDropdown {
  key: string;
  type: 'dropdown';
  title: React.ReactNode | ((editor: Editor) => React.ReactNode);
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
  title: React.ReactNode | ((editor: Editor) => React.ReactNode);
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
  'code',
  'superscript',
  'subscript',
  'divider',
  'align',
  'numbered-list',
  'bulleted-list',
  'divider',
  'block-quote',
  'link',
];

function Toolbar(props: ToolbarProps) {
  const { className, style, sort = baseSort, include, exclude, extraResolver } = props;

  // memoize
  const editor = useSlate();

  const toolbar = useToolbarCtx();

  const { baseResolver, baseRender } = useBaseResolver();

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
  }, [baseResolver, exclude, extra, include, sort]);

  const resolver = useMemo(() => getResolver(), [getResolver]);

  toolbar.current.resolver = baseResolver.concat(extra); // 更新 toolbar 上下文的内容

  // handler
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

  // render
  return (
    <>
      <Space role="toolbar" className={className} style={style} wrap>
        {resolver.map((item, i) => {
          if (item === 'divider') {
            return <Divider key={`${item}-${i}`} type="vertical" />;
          }
          const { key, type } = item;

          let title: React.ReactNode = '';
          if (isFunction(item.title)) {
            title = item.title(editor) as React.ReactNode;
          } else {
            title = item.title as React.ReactNode;
          }

          if (type === 'button') {
            // 普通按钮
            let active = false;
            let icon: React.ReactNode = '';

            if (typeof item.active === 'boolean') {
              active = item.active;
            } else if (isFunction(item.active)) {
              active = item.active(editor);
            }

            if (isFunction(item.icon)) {
              icon = item.icon(editor) as React.ReactNode;
            } else {
              icon = item.icon as React.ReactNode;
            }

            return (
              <Button<ToolbarButton>
                key={key}
                active={active}
                title={title}
                icon={icon}
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
                title={title}
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
              <Tooltip key={item.key} title={title}>
                {jsxElement}
              </Tooltip>
            );
          }
          return null;
        })}
      </Space>
      {baseRender}
    </>
  );
}

export default memo(Toolbar);
