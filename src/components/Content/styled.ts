import { theme } from 'antd';
import { css } from '@emotion/css';

const { useToken } = theme;

export default function useStyled() {
  const { token } = useToken();

  return {
    wrapper: css`
      display: inline-block;
      width: 100%;
      margin: 0;
      padding: 0;
      text-align: left;
    `,
    content: css`
      padding: 10px;
      margin: 0;
      color: ${token.colorText};
      p {
        line-height: 1.74;
        border-radius: ${token.borderRadiusXS}px;
        min-height: 28px;
      }
      code {
        color: ${token.colorError};
        background-color: ${token.colorErrorBg};
        word-break: break-all;
        border-radius: ${token.borderRadiusXS}px;
        font-family: Menlo, Monaco, Consolas, 'Microsoft YaHei', 'Courier New', Courier, monospace;
        padding: 0 0.2em;
      }
      blockquote {
        border-left: 3px solid ${token.colorBorder};
        padding: 0.6em 0.5em;
        word-break: break-all;
        white-space: pre-wrap;
        margin: 1em 0;
        background-color: rgba(0, 0, 0, 0.02);
        border-radius: ${token.borderRadiusXS}px;
        overflow: hidden;
      }
      mark {
        background-color: ${token.colorWarning};
      }
      s {
        color: ${token.colorTextDisabled};
        text-decoration-color: ${token.colorError};
      }
    `,
  };
}
