import {useState, useCallback, useMemo, useEffect, useRef} from 'react';
import { useNextTick } from 'src/hooks';
import type {Editor} from 'slate';

export default function useAccessories(getEditor: () => Editor) {
  const editorFn = useRef(getEditor);

  editorFn.current = getEditor;

  // accessories
  const nextTick = useNextTick(50);

  const [search, setSearch] = useState('');

  const [activeSearchKey, setActiveSearchKey] = useState('');

  const [searchResult, setSearchResult] = useState<any[]>([]);

  const handleSetSearch = useCallback(
    (v: string) => {
      setSearch(v);
      nextTick(() => {
        const _editor = editorFn.current();
        // 需要等待search界面更新完成
        const nodes = _editor.getEditableSearchResult();
        setSearchResult(nodes);
      });
    },
    [nextTick]
  );

  const handleSetSearchKey = useCallback((v: string) => {
    setActiveSearchKey(v);
  }, []);

  const accessories = useMemo(
    () => ({
      search,
      setSearch: handleSetSearch,
      activeSearchKey,
      setActiveSearchKey: handleSetSearchKey,
      searchResult,
    }),
    [activeSearchKey, handleSetSearch, handleSetSearchKey, search, searchResult]
  );

  useEffect(() => {
    nextTick(() => {
      if (activeSearchKey) {
        // scrollintoview
        const _editor = editorFn.current();
        const textbox = _editor.getEditableDOM();
        const ele = textbox.querySelector(`mark[data-slate-decorate-search="${activeSearchKey}"]`);
        ele?.scrollIntoView();
      }
    });
  }, [activeSearchKey, nextTick]);

  return accessories;

}
