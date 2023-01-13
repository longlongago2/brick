import { useMemo } from 'react';
import { theme } from 'antd';
import { css } from '@emotion/css';

const { useToken } = theme;

export default function useStyled() {
  const { token } = useToken();

  const classnames = useMemo(
    () => ({
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
        pointer-events: none;
        z-index: 9;
        &--handle {
          position: absolute;
          width: 14px;
          height: 14px;
          padding: 0;
          margin: 0;
          border: 3px solid ${token.colorBgContainer};
          background-color: #2f8ef4;
          border-radius: 50%;
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
          &::after {
            display: inline;
            content: attr(data-size);
          }
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
          pointer-events: all;
          transition: all 0.3s ease;
          &:hover {
            cursor: pointer;
            background-color: rgba(255, 255, 255, 0.7);
            color: ${token.colorTextSecondary};
          }
        }
      `,
      modal: css`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        backdrop-filter: blur(55px) grayscale(10%);
        > img {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: auto !important;
          height: 100% !important;
          transition: all 0.3 ease;
        }
      `,
    }),
    [token]
  );

  return classnames;
}
