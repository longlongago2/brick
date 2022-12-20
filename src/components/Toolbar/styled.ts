import { theme } from 'antd';
import { css } from '@emotion/css';

const { useToken } = theme;

export default function useStyled() {
  const { token } = useToken();
  return {
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
          width: 40px;
          height: 100%;
        }
        .option--main {
          flex: auto;
          display: inline-flex;
          align-items: center;
          width: 100%;
          height: 100%;
        }
        .option--extra {
          flex: none;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          width: 110px;
          height: 100%;
          color: ${token.colorTextTertiary};
          font-size: 12px;
          text-align: right;
        }
      }
    `,
  };
}
