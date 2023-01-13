import { useMemo } from 'react';
import { theme } from 'antd';
import { css } from '@emotion/css';

const { useToken } = theme;

export default function useStyled() {
  const { token } = useToken();

  const classnames = useMemo(
    () => ({
      selector: css`
        .ant-select-selector {
          &:hover {
            background-color: ${token.colorBgTextHover} !important;
          }
        }
      `,
      option: css`
        width: 100%;
        .ant-select-item-option-content {
          display: inline-flex;
          font-weight: normal !important;
          .option--icon {
            flex: none;
            display: flex;
            align-items: center;
            width: 30px;
            height: 100%;
          }
          .option--main {
            flex: auto;
            display: inline-flex;
            align-items: center;
            width: 100%;
            height: 100%;
            font-size: 13px;
          }
          .option--extra {
            flex: none;
            display: inline-flex;
            align-items: center;
            justify-content: flex-end;
            width: 85px;
            height: 100%;
            color: ${token.colorTextTertiary};
            font-size: 12px;
            font-family: 'Courier New', Courier, monospace;
            text-align: right;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      `,
      dragHandler: css`
        width: 100%;
        min-height: 35px;
        cursor: move;
        &.disabled {
          cursor: default;
        }
      `,
      dragModal: css`
        overflow: hidden !important;
        .ant-modal {
          margin: 0 !important;
          top: unset !important;
        }
      `,
      colorPicker: css`
        position: relative;
        text-align: center;
        margin-top: -2px;
        .color-picker--inner {
          display: inline-block;
          font-size: 14px;
          font-family: Arial, Helvetica, sans-serif;
        }
        .color-picker--color {
          position: absolute;
          display: inline-block;
          width: 100%;
          height: 2px;
          background-color: ${token.colorText};
          margin: auto;
          left: 0;
          bottom: 2px;
        }
      `,
      dropdownIcon: css`
        color: ${token.colorTextPlaceholder};
        font-size: 11px;
      `,
      dropdownButton: css`
        padding: 0 3px !important;
      `,
      sketchPicker: css`
        background-color: red;
        input[id*='rc-editable-input'] {
          border-radius: 3px;
          box-shadow: none !important;
          border: 1px solid ${token.colorBorder} !important;
          outline: none;
          &:focus {
            outline: 1px solid ${token.colorPrimary};
          }
        }
      `,
      searchIndicator: css`
        position: absolute;
        top: 4px;
        right: 8px;
        font-size: 14px;
        color: ${token.colorTextTertiary};
      `,
      searchTypeButton: css`
        width: 25px !important;
        height: 100%;
        font-size: 12px;
        border-radius: ${token.borderRadiusXS}px;
      `,
      linkButton: css`
        * {
          font-size: 12px;
        }
      `,
      between: css`
        width: 100%;
        display: flex;
        justify-content: space-between;
      `,
      mp0: css`
        padding: 0;
        margin: 0;
      `,
      bold: css`
        font-weight: 600;
      `,
    }),
    [token]
  );

  return classnames;
}
