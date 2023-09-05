import { theme } from 'antd';
import { css } from '@emotion/css';

const { useToken } = theme;

export default function useStyled() {
  const { token } = useToken();

  return {
    blockSelected: css`
      position: relative;
      background-color: ${token.colorFillQuaternary};
      box-shadow: 0 0 0 1px ${token.colorFillSecondary};
      z-index: 1;
      &--blur {
        background-color: transparent;
      }
    `,
    inlineSelected: css`
      position: relative;
      background-color: ${token.colorPrimaryBg};
      box-shadow: 0 0 0 0.5px ${token.colorPrimaryBorder};
      z-index: 1;
      &--blur {
        background-color: ${token.colorBgContainerDisabled};
        box-shadow: 0 0 0 0.5px ${token.colorBorder};
      }
    `,
    image: css`
      position: relative;
      display: inline-block;
      font-size: 0;
      clear: both;
      vertical-align: bottom;
      transition: all 0.3s ease;
      &--block {
        display: block;
        margin: 16px 0;
      }
    `,
    imageCore: css`
      position: relative;
      font-size: 0;
      display: inline-block;
      width: 100%;
    `,
    link: css`
      display: inline-block;
      color: ${token.colorLink};
      border-radius: ${token.borderRadiusXS}px;
      transition: all 0.3s ease;
    `,
    paragraphCore: css`
      position: relative;
      transition: all 0.3s ease;
      &--locked {
        cursor: default;
        color: ${token.colorTextTertiary};
        opacity: 0.7;
      }
    `,
  };
}
