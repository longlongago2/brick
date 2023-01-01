import { useState } from 'react';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { withCommand } from '../utils/withCommand';
import { withPrototype } from '../utils/withPrototype';

/**
 * @description Create BrickyProvider props editor
 * @export
 * @return {*}
 */
export function useBrickyEditor() {
  const [editor] = useState(() => withCommand(withPrototype(withHistory(withReact(createEditor())))));
  return editor;
}
