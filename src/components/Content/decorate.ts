import { Text } from 'slate';
import type { NodeEntry } from 'slate';
import type { EditorDecorate, DecorateRange } from '../../types';



export default function decorte(entry: NodeEntry) {
  const [node, path] = entry;
  return (params: EditorDecorate) => {
    const { search } = params;
    const ranges: DecorateRange[] = [];

    if (search && Text.isText(node)) {
      const { text } = node;
      const parts = text.split(search);
      let offset = 0;

      parts.forEach((part, i) => {
        if (i !== 0) {
          const uuid = Math.random().toString(36).slice(2);
          ranges.push({
            anchor: { path, offset: offset - search.length },
            focus: { path, offset },
            highlight: {
              color: '#ffff00',
              search: {
                activeColor: '#ff9632',
                key: uuid,
                offset: offset - search.length
              },
            }, // MarkText properties 搜索利用高亮属性高亮搜索内容
          });
        }

        offset = offset + part.length + search.length;
      });
    }

    return ranges;
  };
}
