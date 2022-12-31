import { useState } from 'react';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { withCommand } from '../utils/withCommand';
import { withPrototype } from '../utils/withPrototype';

/**
 * @description 获取最终 editor，注意：withCommand要放在最外层，确保可以使用其他插件的函数
 * @export
 * @return {*}
 */
export function useEditorState() {
  const [editor] = useState(() => withCommand(withPrototype(withHistory(withReact(createEditor())))));
  return editor;
}
