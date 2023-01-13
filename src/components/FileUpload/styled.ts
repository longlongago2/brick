import { useMemo } from 'react';
import { css } from '@emotion/css';

export default function useStyled() {
  const classnames = useMemo(
    () => ({
      core: css`
        cursor: pointer;
      `,
      hidden: css`
        display: none !important;
        visibility: hidden !important;
      `,
    }),
    []
  );

  return classnames;
}
