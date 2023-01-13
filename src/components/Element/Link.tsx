import React, { memo, useCallback, useMemo } from 'react';
import { useSelected, useFocused, useReadOnly, useSlate, ReactEditor } from 'slate-react';
import { Dropdown, message } from 'antd';
import Icon, { DisconnectOutlined, FormOutlined, GlobalOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { copyToClipboard } from '../../utils';
import useBaseResolver from '../Toolbar/useBaseResolver';
import InlineChromiumBugfix from '../InlineChromiumBugfix';
import { SvgrLinkExternal } from '../SvgrIcons';
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

  const { link, inlineSelected } = useStyled();

  const baseResolver = useBaseResolver();

  const linkEle = element as LinkElement;

  const locked = editor.getElementFieldsValue('lock', 'paragraph');

  const linkResolver = useMemo<ToolbarButton>(
    () => baseResolver.find((_) => _.key === 'link') as ToolbarButton,
    [baseResolver]
  );

  const handleMenuClick = useCallback<NonNullable<NonNullable<DropDownProps['menu']>['onClick']>>(
    ({ key }) => {
      if (key === 'unset') {
        editor.unsetLink();
        ReactEditor.focus(editor);
      } else if (key === 'edit') {
        if (linkResolver && linkResolver.onClick) {
          linkResolver.onClick(editor, { target: 'emitter_edit' });
        }
      } else if (key === 'copy') {
        copyToClipboard(linkEle.url)
          .then(() => {
            message.success('链接地址已复制');
          })
          .catch(() => {
            message.error('复制失败，浏览器不支持');
          });
      } else if (key === 'redirect') {
        window.open(linkEle.url, '_blank');
      }
    },
    [editor, linkEle, linkResolver]
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
          label: '复制链接地址',
          icon: <GlobalOutlined />,
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

  // 只读状态 / 锁定状态
  if (readOnly || locked) {
    return (
      <a {...attributes} href={linkEle.url} className={link}>
        {children}
      </a>
    );
  }

  // 编辑状态
  return (
    <span onContextMenu={preventContextMenu}>
      <Dropdown trigger={trigger} menu={menu}>
        <a
          {...attributes}
          href={linkEle.url}
          className={classNames(link, {
            [inlineSelected]: selected,
            [`${inlineSelected}--blur`]: selected && !focused,
          })}
        >
          <InlineChromiumBugfix />
          {children}
          <InlineChromiumBugfix />
        </a>
      </Dropdown>
      {linkResolver.attachRender}
    </span>
  );
}

export default memo(Link);
