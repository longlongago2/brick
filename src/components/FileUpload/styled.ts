import { css } from '@emotion/css';

export default function useStyled() {
  return {
    core: css`
      cursor: pointer;
    `,
    hidden: css`
      display: none !important;
      visibility: hidden !important;
    `,
  };
}
