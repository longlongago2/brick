import { theme } from 'antd';
import { css } from '@emotion/css';

const { useToken } = theme;

export default function useStyled() {
  const { token } = useToken();
  return {
    content: css`
      padding: 10px;
      margin: 0;
      color: ${token.colorText};
      code {
        color: ${token.colorError};
        background-color: ${token.colorErrorBg};
        word-break: break-all;
        border-radius: 2px;
        font-family: Menlo, Monaco, Consolas, 'Courier New', Courier, monospace;
        padding: 0 5px;
      }
      blockquote {
        background-color: ${token.colorBgTextHover};
        border-left: 5px solid ${token.colorPrimary};
        padding: 1em;
        word-break: break-all;
        white-space: pre-wrap;
        margin: 0;
        line-height: 1.5;
      }
      mark {
        background-color: #ffff00;
      }
      s {
        color: ${token.colorTextDisabled};
        text-decoration-color: ${token.colorError};
      }
    `,
  };
}
