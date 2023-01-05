/* eslint-disable react/display-name */
import React, { memo } from 'react';

export type DynamicElementProps<T extends HTMLElement> = {
  tag?: string;
} & React.HTMLAttributes<T>;

const DynamicElement = React.forwardRef<HTMLElement, DynamicElementProps<HTMLElement>>((props, ref) => {
  const { tag = 'div', children, ...htmlAttributes } = props;
  return React.createElement(tag, { ref, ...htmlAttributes }, children);
});

export default memo(DynamicElement);
