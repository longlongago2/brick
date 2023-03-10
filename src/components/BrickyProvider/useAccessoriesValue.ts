import { useState, useCallback, useMemo, useEffect, useRef, useTransition } from 'react';
import { useNextTick } from '../../hooks';
import type { Editor } from 'slate';
import type { SearchResult } from '../../types';

export default function useAccessoriesValue(getEditor: () => Editor) {
  const editorFn = useRef(getEditor);

  editorFn.current = getEditor;

  // accessories
  const nextTick = useNextTick(50);

  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState('');

  const [activeSearchKey, setActiveSearchKey] = useState('');

  const [searchResult, setSearchResult] = useState<SearchResult[]>([]);

  const getSearchResult = useCallback(() => {
    startTransition(() => {
      // 非紧急任务，可以等待其他紧急任务完成后再执行
      const _editor = editorFn.current();
      const nodes = _editor.getEditableSearchResult();
      setSearchResult(nodes);
    });
  }, []);

  const handleSetSearch = useCallback(
    (v: string) => {
      setSearch(v);
      // 需要等待search界面更新完成
      nextTick(() => {
        getSearchResult();
      });
    },
    [getSearchResult, nextTick]
  );

  const updateAccessories = useCallback(() => {
    nextTick(() => {
      if (search) {
        getSearchResult();
      }
    });
  }, [getSearchResult, nextTick, search]);

  const handleSetSearchKey = useCallback((v: string) => {
    setActiveSearchKey(v);
  }, []);

  const accessories = useMemo(
    () => ({
      researching: isPending,
      search,
      setSearch: handleSetSearch,
      activeSearchKey,
      setActiveSearchKey: handleSetSearchKey,
      searchResult,
    }),
    [activeSearchKey, handleSetSearch, handleSetSearchKey, isPending, search, searchResult]
  );

  useEffect(() => {
    nextTick(() => {
      if (activeSearchKey) {
        // scrollintoview
        const _editor = editorFn.current();
        const textbox = _editor.getEditableDOM();
        const ele = textbox.querySelector(`mark[data-slate-decorate-search-key="${activeSearchKey}"]`);
        ele?.scrollIntoView();
      }
    });
  }, [activeSearchKey, nextTick]);

  return { accessories, updateAccessories };
}
