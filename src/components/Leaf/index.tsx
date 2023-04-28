import React, { memo } from 'react';
import { useSlate } from 'slate-react';
import type { RenderLeafProps } from 'slate-react';

function Leaf(props: RenderLeafProps) {
  const { attributes, children } = props;

  const editor = useSlate();

  const leaf = props.leaf;

  const style: React.CSSProperties = {};

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
    const _attributes: Record<string, any> = {};
    // Advanced highlight
    if (typeof leaf.highlight === 'object') {
      let showSearchActiveColor = false;
      // Search highlight
      if (leaf.highlight.search) {
        const { key, activeColor } = leaf.highlight.search;
        _attributes['data-slate-decorate-search-key'] = key;
        if (editor.search.activeSearchKey === key) {
          _attributes['data-slate-decorate-search-active'] = true;
          if (activeColor) {
            showSearchActiveColor = true;
            style.backgroundColor = activeColor;
          }
        }
      }
      // Common highlight
      if (!showSearchActiveColor) {
        style.backgroundColor = leaf.highlight.color;
      }
    }
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
