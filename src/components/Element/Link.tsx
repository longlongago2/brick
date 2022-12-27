import React, { memo, useCallback, useMemo } from 'react';
import { useSelected, useFocused, useReadOnly, useSlate } from 'slate-react';
import { Dropdown } from 'antd';
import Icon, { CopyOutlined, DisconnectOutlined, FormOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import InlineChromiumBugfix from '../InlineChromiumBugfix';
import SvgrLinkExternal from 'src/assets/link-external.svg';
import { useToolbarCtx } from 'src/hooks';
import useStyled from './styled';

import type { RenderElementProps } from 'slate-react';
import type { LinkElement } from 'slate';
import type { DropDownProps } from 'antd';
import type { ToolbarButton } from '../Toolbar';

const trigger: DropDownProps['trigger'] = ['contextMenu'];

function Link(props: RenderElementProps) {
  const { attributes, children, element } = props;

  const editor = useSlate();

  const selected = useSelected();

  const focused = useFocused();

  const readOnly = useReadOnly();

  const toolbar = useToolbarCtx();

  const { link } = useStyled();

  const linkEle = element as LinkElement;

  const paragraphLocked = editor.getElementFieldsValue('lock', 'paragraph');

  const handleMenuClick = useCallback<
    Exclude<Exclude<DropDownProps['menu'], undefined>['onClick'], undefined>
  >(
    ({ key }) => {
      if (key === 'unset') {
        editor.unsetLink();
      } else if (key === 'edit') {
        const bar = toolbar.current.resolver?.find((_) => _.key === 'link') as ToolbarButton;
        if (bar) bar.onClick?.(editor, { target: 'emit-edit' });
      } else if (key === 'copy') {
        console.log('copy');
      } else if (key === 'redirect') {
        window.open(linkEle.url, '_blank');
      }
    },
    [editor, linkEle.url, toolbar]
  );

  const preventContextMenu: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const menu = useMemo<DropDownProps['menu']>(
    () => ({
      items: [
        {
          key: 'unset',
          label: '取消超链接',
          icon: <DisconnectOutlined style={{ color: 'red' }} />,
        },
        {
          key: 'edit',
          label: '编辑超链接',
          icon: <FormOutlined />,
        },
        {
          key: 'copy',
          label: '复制超链接',
          icon: <CopyOutlined />,
        },
        {
          key: 'redirect',
          label: '打开超链接',
          icon: <Icon component={SvgrLinkExternal} />,
        },
      ],
      onClick: handleMenuClick,
    }),
    [handleMenuClick]
  );

  if (readOnly) {
    return (
      <a {...attributes} href={linkEle.url} className={link}>
        {children}
      </a>
    );
  }

  const core = (
    <a
      {...attributes}
      href={linkEle.url}
      className={classNames(link, {
        'link--selected': selected,
        'link--selected-blur': selected && !focused,
      })}
    >
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </a>
  );

  if (paragraphLocked) {
    return core;
  }

  return (
    <span onContextMenu={preventContextMenu}>
      <Dropdown trigger={trigger} menu={menu}>
        {core}
      </Dropdown>
    </span>
  );
}

export default memo(Link);
