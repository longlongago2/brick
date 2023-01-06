import React, { memo, useMemo, useCallback } from 'react';
import { useSelected, useFocused, useSlate, ReactEditor } from 'slate-react';
import Icon, {
  BlockOutlined,
  CloseOutlined,
  FormOutlined,
  GlobalOutlined,
  PicCenterOutlined,
  PicLeftOutlined,
  PicRightOutlined,
} from '@ant-design/icons';
import { Dropdown, message } from 'antd';
import classNames from 'classnames';
import InlineSvgr from 'src/assets/inline.svg';
import WrapSvgr from 'src/assets/wrap.svg';
import { copyToClipboard } from 'src/utils';
import DynamicElement from '../DynamicElement';
import ImageEnhancer from '../ImageEnhancer';
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

  const { image, imageCore, inlineSelected, blockSelected } = useStyled();

  const paragraphLocked = editor.getElementFieldsValue('lock', 'paragraph');

  const preventContextMenu: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    e.target.dispatchEvent(event);
  };

  const handleMenuClick = useCallback<NonNullable<NonNullable<DropDownProps['menu']>['onClick']>>(
    ({ key }) => {
      const floatKeys = ['left', 'right']; // 浮动互斥选项
      const typeKeys = ['inline', 'block']; // 元素类型互斥选项
      // handler
      if (floatKeys.includes(key)) {
        // 设置浮动
        const prefloat = editor.getElementFieldsValue('float', 'image');
        const float = key;
        editor.setElementProperties('image', { float: prefloat === float ? undefined : float });
        ReactEditor.focus(editor);
      } else if (typeKeys.includes(key)) {
        // 设置元素类型
        editor.setElementProperties('image', { inline: key === 'inline' }, { refactor: true });
        ReactEditor.focus(editor);
      } else if (key === 'copy') {
        const url = editor.getElementFieldsValue('url', 'image');
        copyToClipboard(url)
          .then(() => {
            message.success('图片地址已复制');
          })
          .catch(() => {
            message.error('复制失败，浏览器不支持');
          });
      } else if (key === 'delete') {
        editor.removeElement('image');
        ReactEditor.focus(editor);
      }
    },
    [editor]
  );

  const menu = useMemo<DropDownProps['menu']>(
    () => ({
      items: [
        {
          key: 'delete',
          label: '删除图片',
          icon: <CloseOutlined style={{ color: 'red' }} />,
        },
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
        imageEle.inline && {
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
      selectedKeys: [editor.isInline(imageEle) ? 'inline' : 'block', imageEle.float].filter(
        Boolean as any as ExcludesFalse
      ),
      onClick: handleMenuClick,
    }),
    [editor, handleMenuClick, imageEle]
  );

  const getStyle = useCallback(() => {
    const style: React.CSSProperties = {};
    if (imageEle.inline && imageEle.float) {
      style.float = imageEle.float;
    }
    if (!imageEle.inline && imageEle.align) {
      style.textAlign = imageEle.align;
    }
    return style;
  }, [imageEle]);

  const style = useMemo<React.CSSProperties>(() => getStyle(), [getStyle]);

  const imageSelected = imageEle.inline ? inlineSelected : blockSelected;

  const core = (
    <span contentEditable={false} className={imageCore}>
      <ImageEnhancer src={imageEle.url} width={imageEle.width} height={imageEle.height} />
    </span>
  );

  if (paragraphLocked) {
    // 段落冻结
    return (
      <DynamicElement
        tag={imageEle.inline ? 'span' : 'section'}
        style={style}
        {...attributes}
        className={classNames(image, {
          [`${image}--block`]: !imageEle.inline,
        })}
      >
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
        [`${image}--block`]: !imageEle.inline,
        [imageSelected]: selected,
        [`${imageSelected}--blur`]: selected && !focused,
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
