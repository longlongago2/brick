import { theme } from 'antd';
import { css } from '@emotion/css';

const { useToken } = theme;

export default function useStyled() {
  const { token } = useToken();

  return {
    katex: css`
      display: inline-block;
      border-radius: ${token.borderRadiusXS}px;
      &--block {
        display: block;
        margin: 16px 0;
      }
    `,
  };
}
