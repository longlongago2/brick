import { theme } from 'antd';
import { css } from '@emotion/css';

const { useToken } = theme;

export default function useStyled() {
  const { token } = useToken();
  return {
    image: css`
      position: relative;
      display: inline-block;
      font-size: 0;
      transition: all 0.3s ease;
      &.image--block {
        display: block;
      }
      &.image--selected {
        background-color: ${token.colorPrimaryBg};
        box-shadow: 0 0 0 0.5px ${token.colorPrimaryBorder};
        border-radius: 2px;
        opacity: 0.9;
      }
      &.image--selected-blur {
        box-shadow: 0 0 0 0.5px ${token.colorBorderSecondary};
        background-color: rgba(0, 0, 0, 0.01);
      }
    `,
    link: css`
      display: inline-block;
      color: ${token.colorLink};
      transition: all 0.3s ease;
      &.link--selected {
        background-color: ${token.colorPrimaryBg};
        box-shadow: 0 0 0 0.5px ${token.colorPrimaryBorder};
        border-radius: 2px;
      }
      &.link--selected-blur {
        box-shadow: 0 0 0 0.5px ${token.colorBorderSecondary};
        background-color: rgba(0, 0, 0, 0.01);
      }
    `,
    paragraphLock: css`
      cursor: default;
      color: ${token.colorTextTertiary};
    `,
  };
}
