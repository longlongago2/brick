import React, { memo } from 'react';
import { useAccessories } from 'src/hooks';
import type { RenderLeafProps } from 'slate-react';

function Leaf(props: RenderLeafProps) {
  const { attributes, children } = props;

  const leaf = props.leaf;

  const style: React.CSSProperties = {};

  const { activeSearchKey } = useAccessories();

  if ('fontsize' in leaf && leaf.fontsize) {
    style.fontSize = leaf.fontsize;
  }

  if ('color' in leaf && leaf.color) {
    style.color = leaf.color;
  }

  let text = children;

  if ('bold' in leaf && leaf.bold) {
    text = <strong style={style}>{text}</strong>;
  }

  if ('code' in leaf && leaf.code) {
    text = <code style={style}>{text}</code>;
  }

  if ('italic' in leaf && leaf.italic) {
    text = <em style={style}>{text}</em>;
  }

  if ('underline' in leaf && leaf.underline) {
    text = <u style={style}>{text}</u>;
  }

  if ('linethrough' in leaf && leaf.linethrough) {
    text = <s style={style}>{text}</s>;
  }

  if ('highlight' in leaf && leaf.highlight) {
    let searchkey;
    if (typeof leaf.highlight === 'object') {
      searchkey = leaf.highlight.searchkey;
      if (!!searchkey && activeSearchKey === searchkey) {
        // Active of search result highlight
        style.backgroundColor = '#ff9632';
      } else {
        // Common highlight
        style.backgroundColor = leaf.highlight.color;
      }
    }
    text = (
      <mark style={style} {...(!!searchkey && { 'data-slate-decorate-search': searchkey })}>
        {text}
      </mark>
    );
  }

  if ('superscript' in leaf && leaf.superscript) {
    text = <sup style={style}>{text}</sup>;
  }

  if ('subscript' in leaf && leaf.subscript) {
    text = <sub style={style}>{text}</sub>;
  }

  return (
    <span style={style} {...attributes}>
      {text}
    </span>
  );
}

export default memo(Leaf);
