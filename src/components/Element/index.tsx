import React, { memo } from 'react';
import Image from './Image';
import Link from './Link';
import Paragraph from './Paragraph';

import type { RenderElementProps } from 'slate-react';

function Element(props: RenderElementProps) {
  const { attributes, children, element } = props;

  const style: React.CSSProperties = {};

  if ('align' in element) {
    style.textAlign = element.align;
  }

  switch (element.type) {
    case 'heading-one':
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case 'heading-three':
      return (
        <h3 style={style} {...attributes}>
          {children}
        </h3>
      );
    case 'heading-four':
      return (
        <h4 style={style} {...attributes}>
          {children}
        </h4>
      );
    case 'heading-five':
      return (
        <h5 style={style} {...attributes}>
          {children}
        </h5>
      );
    case 'heading-six':
      return (
        <h6 style={style} {...attributes}>
          {children}
        </h6>
      );
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case 'numbered-list':
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case 'link':
      return <Link {...props} />;
    case 'image':
      return <Image {...props} />;
    default:
      return <Paragraph {...props} />;
  }
}

export default memo(Element);
