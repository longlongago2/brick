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
      clear: both;
      overflow: hidden;
      transition: all 0.3s ease;
      &.image--block {
        display: block;
        &.image--selected {
          box-shadow: 0 0 0 0.5px ${token.colorPrimaryBorder} !important;
        }
      }
      &.image--selected {
        background-color: ${token.colorPrimaryBg};
        box-shadow: 0 0 0 3px ${token.colorPrimaryBorder};
        border-radius: 2px;
        opacity: 0.85;
        z-index: 1;
      }
      &.image--selected-blur {
        box-shadow: 0 0 0 0.5px ${token.colorBorderSecondary};
        background-color: rgba(0, 0, 0, 0.01);
        z-index: 1;
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
    paragraphLocked: css`
      cursor: default;
      color: ${token.colorTextTertiary};
      opacity: 0.7;
    `,
    paragraphCore: css`
      transition: all 0.3s ease;
      &.selected {
        background-color: rgba(0, 0, 0, 0.02);
        box-shadow: 0 0 0 1px ${token.colorBorderSecondary};
      }
    `,
    dragButton: css`
      position: absolute;
      top: 2px;
      right: 2px;
      cursor: move;
      display: flex;
      align-items: center;
      > span {
        font-size: 12px;
        line-height: 1;
        color: ${token.colorTextTertiary};
      }
      .anticon {
        font-size: 14px;
        height: 14px;
        width: 14px;
        color: ${token.colorText};
      }
    `,
  };
}
