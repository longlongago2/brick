import React, { memo, useMemo, useCallback, useState } from 'react';
import { useSelected, useFocused, useSlate, ReactEditor } from 'slate-react';
import Icon, {
  BlockOutlined,
  FormOutlined,
  GlobalOutlined,
  PicCenterOutlined,
  PicLeftOutlined,
  PicRightOutlined,
} from '@ant-design/icons';
import { Dropdown } from 'antd';
import classNames from 'classnames';
import InlineSvgr from 'src/assets/inline.svg';
import WrapSvgr from 'src/assets/wrap.svg';
import DynamicElement from '../DynamicElement';
import useStyled from './styled';

import type { RenderElementProps } from 'slate-react';
import type { ImageElement } from 'slate';
import type { DropDownProps } from 'antd';

const trigger: DropDownProps['trigger'] = ['contextMenu'];

function Image(props: RenderElementProps) {
  const { attributes, children, element } = props;

  const imageEle = element as ImageElement;

  const editor = useSlate();

  const selected = useSelected();

  const focused = useFocused();

  const { image } = useStyled();

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const paragraphLocked = editor.getElementFieldsValue('lock', 'paragraph');

  const preventContextMenu: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    e.target.dispatchEvent(event);
  };

  const handleMenuSelect = useCallback<NonNullable<NonNullable<DropDownProps['menu']>['onSelect']>>(
    ({ key }) => {
      const floatKeys = ['left', 'right']; // 浮动互斥选项
      const typeKeys = ['inline', 'block']; // 元素类型互斥选项
      if ([...floatKeys, ...typeKeys].includes(key)) {
        // 只有上述选项可选择
        setSelectedKeys((keys) => {
          if (floatKeys.includes(key)) {
            // 处理浮动选项互斥
            return keys.filter((_) => !floatKeys.find((__) => __ === _)).concat(key);
          }
          if (typeKeys.includes(key)) {
            // 处理元素类型选项互斥
            return keys.filter((_) => !typeKeys.find((__) => __ === _)).concat(key);
          }
          return keys.concat(key);
        });
      }
      // handler
      if (floatKeys.includes(key)) {
        // 设置浮动
        editor.setElementProperties('image', { float: key });
        ReactEditor.focus(editor);
      } else if (typeKeys.includes(key)) {
        // 设置元素类型
        editor.setElementProperties('image', { inline: key === 'inline' });
        ReactEditor.focus(editor);
      }
    },
    [editor]
  );

  const menu = useMemo<DropDownProps['menu']>(
    () => ({
      items: [
        {
          key: 'edit',
          label: '编辑图片',
          icon: <FormOutlined />,
        },
        {
          key: 'copy',
          label: '复制图片地址',
          icon: <GlobalOutlined />,
        },
        !!imageEle.inline && {
          key: 'float',
          label: '设置浮动',
          icon: <PicCenterOutlined />,
          children: [
            {
              key: 'left',
              label: '左浮动',
              icon: <PicLeftOutlined />,
            },
            {
              key: 'right',
              label: '右浮动',
              icon: <PicRightOutlined />,
            },
          ],
        },
        {
          key: 'type',
          label: '元素类型',
          icon: <BlockOutlined />,
          children: [
            {
              key: 'inline',
              label: '行内元素',
              icon: <Icon component={InlineSvgr} />,
            },
            {
              key: 'block',
              label: '块级元素',
              icon: <Icon component={WrapSvgr} />,
            },
          ],
        },
      ].filter(Boolean as any as ExcludesFalse),
      selectable: true,
      selectedKeys,
      onSelect: handleMenuSelect,
    }),
    [handleMenuSelect, imageEle, selectedKeys]
  );

  const style = useMemo<React.CSSProperties | undefined>(
    () => (imageEle.inline && imageEle.float ? { float: imageEle.float } : undefined),
    [imageEle]
  );

  const core = (
    <DynamicElement tag={imageEle.inline ? 'span' : 'div'} contentEditable={false}>
      <img src={imageEle.url} width={imageEle.width} height={imageEle.height} />
    </DynamicElement>
  );

  if (paragraphLocked) {
    // 段落冻结
    return (
      <DynamicElement tag={imageEle.inline ? 'span' : 'section'} style={style} {...attributes}>
        {children}
        {core}
      </DynamicElement>
    );
  }

  return (
    <DynamicElement
      tag={imageEle.inline ? 'span' : 'section'}
      style={style}
      {...attributes}
      className={classNames(image, {
        'image--block': !imageEle.inline,
        'image--selected': selected,
        'image--selected-blur': selected && !focused,
      })}
      onContextMenu={preventContextMenu}
    >
      {children}
      <Dropdown trigger={trigger} menu={menu}>
        {core}
      </Dropdown>
    </DynamicElement>
  );
}

export default memo(Image);
