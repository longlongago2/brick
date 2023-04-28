import { useState } from 'react';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import withCommand from '../modifier/withCommand';
import withOverride from '../modifier/withOverride';
import withSearch from '../modifier/withSearch';

/**
 * @description Create BrickyProvider props editor
 * @export
 * @return {*}
 */
export function useBrickyEditor() {
  const [editor] = useState(() =>
    withSearch(withCommand(withOverride(withHistory(withReact(createEditor())))))
  );
  return editor;
}
