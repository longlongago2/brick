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
      display: inline-flex;
      width: 100%;
      .option--icon {
        flex: none;
        display: flex;
        align-items: center;
        width: 60px;
        height: 100%;
      }
      .option--main {
        flex: auto;
        display: inline-block;
        width: 100%;
        height: 100%;
      }
      .option--extra {
        flex: none;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        width: 120px;
        height: 100%;
      }
    `,
  };
}
