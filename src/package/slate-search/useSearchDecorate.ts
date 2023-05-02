import { useCallback } from 'react';
import { Text } from 'slate';
import { useSlateSearch } from '.';
import type { NodeEntry } from 'slate';
import type { DecorateRange } from '../../types';

export function useSearchDecorate() {
  const slateSearch = useSlateSearch();

  const decorate = useCallback((entry: NodeEntry) => {
    const [node, path] = entry;
    const ranges: DecorateRange[] = [];
    const { keyword } = slateSearch.getState();

    if (keyword && Text.isText(node)) {
      const { text } = node;
      const parts = text.split(keyword);
      let offset = 0;

      parts.forEach((part, i) => {
        if (i !== 0) {
          const key = btoa(JSON.stringify(path.concat(offset)));

          const mark = slateSearch.createSearchMark(key);

          ranges.push({
            anchor: { path, offset: offset - keyword.length },
            focus: { path, offset },
            // Mark
            ...mark,
          });
        }

        offset = offset + part.length + keyword.length;
      });
    }

    return ranges;
  }, [slateSearch]);

  return decorate;
}
