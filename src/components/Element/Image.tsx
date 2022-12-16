import React, { memo } from 'react';
import { useSelected, useFocused } from 'slate-react';
import type { RenderElementProps } from 'slate-react';
import type { ImageElement } from 'slate';

function Image(props: RenderElementProps) {
  const { attributes, children, element } = props;

  const imagEle = element as ImageElement;

  const selected = useSelected();
  const focused = useFocused();

  return (
    <div {...attributes} contentEditable={false}>
      {children}
      <img src={imagEle.url} width={imagEle.width} height={imagEle.height} />
    </div>
  );
}

export default memo(Image);
