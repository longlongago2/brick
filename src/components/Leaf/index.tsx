import React, { memo } from 'react';
import type { RenderLeafProps } from 'slate-react';

function Leaf(props: RenderLeafProps) {
  const { attributes, children } = props;

  const leaf = props.leaf;

  let text = children;

  if ('bold' in leaf && leaf.bold) {
    text = <strong>{text}</strong>;
  }

  if ('code' in leaf && leaf.code) {
    text = <code>{text}</code>;
  }

  if ('italic' in leaf && leaf.italic) {
    text = <em>{text}</em>;
  }

  if ('underline' in leaf && leaf.underline) {
    text = <u>{text}</u>;
  }

  if ('linethrough' in leaf && leaf.linethrough) {
    text = <s>{text}</s>;
  }

  if ('highlight' in leaf && leaf.highlight) {
    text = <mark>{text}</mark>;
  }

  return <span {...attributes}>{text}</span>;
}

export default memo(Leaf);
