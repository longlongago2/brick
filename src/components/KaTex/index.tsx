import 'katex/dist/katex.css'; // TODO: 测试 umd 模式打包 css fonts， miniCssExtract
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
