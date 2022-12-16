import { useState } from 'react';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { withCommand } from '../utils/withCommand';
import { withPrototype } from '../utils/withPrototype';

export function useEditorState() {
  const [editor] = useState(() => withPrototype(withCommand(withHistory(withReact(createEditor())))));
  return editor;
}
