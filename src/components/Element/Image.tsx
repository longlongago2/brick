import React, { memo } from 'react';
import { useSelected, useFocused } from 'slate-react';
import classNames from 'classnames';
import useStyled from './styled';

import type { RenderElementProps } from 'slate-react';
import type { ImageElement } from 'slate';

function Image(props: RenderElementProps) {
  const { attributes, children, element } = props;

  const imagEle = element as ImageElement;

  const selected = useSelected();

  const focused = useFocused();

  const { image } = useStyled();

  return (
    <span
      {...attributes}
      contentEditable={!!imagEle.inline}
      className={classNames(image, {
        'image--block': !imagEle.inline,
        'image--selected': selected,
        'image--selected-blur': selected && !focused,
      })}
    >
      {children}
      <img src={imagEle.url} width={imagEle.width} height={imagEle.height} />
    </span>
  );
}

export default memo(Image);
