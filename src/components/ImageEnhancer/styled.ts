import { theme } from 'antd';
import { css } from '@emotion/css';

const { useToken } = theme;

export default function useStyled() {
  const { token } = useToken();
  return {
    enhancer: css`
      position: relative;
      display: inline-block;
      > img {
        transition: all 0.3s ease;
      }
    `,
    resizable: css`
      display: inline-block;
      position: absolute;
      width: 100%;
      height: 100%;
      border: 2px solid #2f8ef4;
      box-sizing: border-box;
      background-color: rgba(0, 0, 0, 0.2);
      z-index: 99;
      &--handle {
        width: 14px;
        height: 14px;
        padding: 0;
        margin: 0;
        border: 3px solid #fff;
        background-color: #2f8ef4;
        border-radius: 50%;
        position: absolute;
        box-sizing: border-box;
      }
      &--handle-tl {
        top: -7px;
        left: -7px;
        cursor: nwse-resize;
        pointer-events: all;
      }
      &--handle-tr {
        top: -7px;
        right: -7px;
        cursor: nesw-resize;
        pointer-events: all;
      }
      &--handle-bl {
        bottom: -7px;
        left: -7px;
        cursor: nesw-resize;
        pointer-events: all;
      }
      &--handle-br {
        bottom: -7px;
        right: -7px;
        cursor: nwse-resize;
        pointer-events: all;
      }
      &--size {
        display: inline-block;
        position: absolute;
        top: 5px;
        right: 5px;
        font-size: 12px;
        color: #fff;
        line-height: 1;
      }
      &--preview {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: transparent;
        color: #fff;
        line-height: 1;
        padding: 7px;
        margin: 0;
        border: 0;
        border-radius: 50%;
        transition: all 0.3s ease;
        &:hover {
          cursor: pointer;
          background-color: rgba(255, 255, 255, 0.7);
          color: ${token.colorTextSecondary};
        }
      }
    `,
  };
}
