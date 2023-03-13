import React, { memo } from 'react';
import { useBrickySearch } from '../../hooks';
import type { RenderLeafProps } from 'slate-react';

function Leaf(props: RenderLeafProps) {
  const { attributes, children } = props;

  const leaf = props.leaf;

  const style: React.CSSProperties = {};

  const { activeSearchKey } = useBrickySearch();

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
    let key;
    let offset;
    let isSearched = false;
    if (typeof leaf.highlight === 'object') {
      key = leaf.highlight.search?.key;
      offset = leaf.highlight.search?.offset;
      isSearched = !!leaf.highlight.search;
      if (isSearched && activeSearchKey === key) {
        // Active of search result highlight
        style.backgroundColor = leaf.highlight.search?.activeColor;
      } else {
        // Common highlight
        style.backgroundColor = leaf.highlight.color;
      }
    }
    const _attributes = isSearched && {
      'data-slate-decorate-search-key': key,
      'data-slate-decorate-search-offset': offset,
    };
    text = (
      <mark style={style} {..._attributes}>
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
