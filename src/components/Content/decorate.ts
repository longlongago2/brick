import { Text } from 'slate';
import type { NodeEntry, Editor } from 'slate';
import type { DecorateRange } from '../../types';

export default function decorte(entry: NodeEntry) {
  const [node, path] = entry;
  return (editor: Editor) => {
    const ranges: DecorateRange[] = [];

    const search = editor.search.text;

    console.log(node);
    if (search && Text.isText(node)) {
      const { text } = node;
      const parts = text.split(search);
      let offset = 0;

      console.log(search);

      parts.forEach((part, i) => {
        if (i !== 0) {
          const key = btoa(JSON.stringify(path.concat(offset)));

          const mark = editor.search.createSearchMark(key);
          console.log(mark);


          ranges.push({
            anchor: { path, offset: offset - search.length },
            focus: { path, offset },
            // Mark
            ...mark,
          });
        }

        offset = offset + part.length + search.length;
      });
    }

    return ranges;
  };
}
