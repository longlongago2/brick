import 'katex/dist/katex.css'; // 需要打包css fonts
import React from 'react';
import classNames from 'classnames';
import katex from 'katex';

import useStyled from './styled';

export interface KaTexProps {
  block?: boolean;
}

export default function KaTex(props: KaTexProps) {
  const { block } = props;

  const { katex } = useStyled();

  return (
    <span
      className={classNames(katex, {
        [`${katex}--block`]: block,
      })}
    >
      katex
    </span>
  );
}
