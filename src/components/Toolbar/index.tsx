import React, { memo, useCallback, useMemo } from 'react';
import { useSlate } from 'slate-react';
import { Tooltip, Divider, Space } from 'antd';
import { isFunction, isPowerArray } from '../../utils';
import Button from './Button';
import Selector from './Select';
import useBaseResolver from './useBaseResolver';

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
  disabled?: boolean | ((editor: Editor) => boolean);
  attachRender?: React.ReactElement; // 附带渲染：例如弹出框等
  onClick?: (editor: Editor, e: any) => void;
}

// 下拉按钮
export interface ToolbarDropdown {
  key: string;
  type: 'dropdown';
  title: React.ReactNode | ((editor: Editor) => React.ReactNode);
  width?: number;
  placeholder?: string;
  disabled?: boolean | ((editor: Editor) => boolean);
  optionDisplayField?: keyof DropdownOption;
  showOriginalOption?: boolean;
  options: DropdownOption[];
  activeKey?: DropdownOption['key'] | ((editor: Editor) => DropdownOption['key']);
  attachRender?: React.ReactElement;
  onSelect?: (editor: Editor, v: any, option: any) => void;
}

// 自定义按钮
export interface ToolbarElement {
  key: string;
  type: 'custom';
  title: React.ReactNode | ((editor: Editor) => React.ReactNode);
  element: React.ReactElement | ((editor: Editor) => React.ReactElement);
  attachRender?: React.ReactElement;
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
  fileUpload?: (file: File) => Promise<string>; // 输出 Promise file url
}

export const baseSort = [
  'undo',
  'redo',
  'divider',
  'format',
  'divider',
  'fontsize',
  'bold',
  'italic',
  'linethrough',
  'underline',
  'code',
  'superscript',
  'subscript',
  'divider',
  'color',
  'highlight',
  'divider',
  'align',
  'numbered-list',
  'bulleted-list',
  'block-quote',
  'divider',
  'link',
  'image',
  'formula',
  'divider',
  'search',
];

function Toolbar(props: ToolbarProps) {
  const { className, style, sort = baseSort, include, exclude, extraResolver, fileUpload } = props;

  // memoize
  const editor = useSlate();

  editor.addExtraProperty('fileUpload', fileUpload); // 利用editor上下文共享

  const baseResolver = useBaseResolver();

  const _extraResolver = useMemo(() => extraResolver?.(editor) || [], [editor, extraResolver]);

  const getResolver = useCallback(() => {
    let res = baseResolver
      .filter(({ key }) => !_extraResolver.find((_) => _.key === key))
      .concat(_extraResolver);
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
  }, [_extraResolver, baseResolver, exclude, include, sort]);

  const resolver = useMemo(() => getResolver(), [getResolver]);

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
            let disabled = false;
            let icon: React.ReactNode = '';

            if (typeof item.active === 'boolean') {
              active = item.active;
            } else if (isFunction(item.active)) {
              active = item.active(editor);
            }

            if (typeof item.disabled === 'boolean') {
              disabled = item.disabled;
            } else if (isFunction(item.disabled)) {
              disabled = item.disabled(editor);
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
                disabled={disabled}
                dataset={item}
                onClick={handleButtonClick}
              />
            );
          }
          if (type === 'dropdown') {
            // 下拉按钮
            let value = '';
            let disabled = false;

            if (typeof item.activeKey === 'string') {
              value = item.activeKey;
            } else if (isFunction(item.activeKey)) {
              value = item.activeKey(editor);
            }

            if (typeof item.disabled === 'boolean') {
              disabled = item.disabled;
            } else if (isFunction(item.disabled)) {
              disabled = item.disabled(editor);
            }
            return (
              <Selector<ToolbarDropdown>
                key={key}
                value={value}
                options={item.options}
                title={title}
                width={item.width}
                disabled={disabled}
                placeholder={item.placeholder}
                dataset={item}
                optionDisplayField={item.optionDisplayField}
                showOriginalOption={item.showOriginalOption}
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
              <Tooltip key={item.key} title={title} showArrow={false}>
                {jsxElement}
              </Tooltip>
            );
          }
          return null;
        })}
      </Space>
      {resolver.map((item) => {
        if (typeof item === 'object' && 'attachRender' in item && item.attachRender) {
          return React.cloneElement(item.attachRender, { key: item.key });
        }
        return null;
      })}
    </>
  );
}

export default memo(Toolbar);
