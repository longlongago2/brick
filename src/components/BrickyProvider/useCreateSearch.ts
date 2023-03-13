import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNextTick } from '../../hooks';
import type { Editor } from 'slate';
import type { SearchResult } from '../../types';

/**
 * @description 创建用于编辑器整体搜索的上下文数据
 * @export
 * @param {() => Editor} getEditor
 */
export default function useCreateSearch(getEditor: () => Editor) {
  const editorFn = useRef(getEditor);

  editorFn.current = getEditor;

  const nextTick = useNextTick(50);

  // brickySearchValues
  const [search, setSearch] = useState('');

  const [activeSearchKey, setActiveSearchKey] = useState('');

  const [searchResult, setSearchResult] = useState<SearchResult[]>([]);

  // handlers
  const updateSearchResult = useCallback(() => {
    if (search) {
      nextTick(() => {
        const _editor = editorFn.current();
        const nodes = _editor.getEditableSearchResult();
        setSearchResult(nodes);
      });
    }
  }, [nextTick, search]);

  const scrollIntoActiveSearchView = useCallback(() => {
    if (activeSearchKey) {
      nextTick(() => {
        // scrollintoview
        const _editor = editorFn.current();
        const textbox = _editor.getEditableDOM();
        const ele = textbox.querySelector(`mark[data-slate-decorate-search-key="${activeSearchKey}"]`);
        ele?.scrollIntoView();
      });
    }
  }, [activeSearchKey, nextTick]);

  // memoized
  const brickySearchValues = useMemo(
    () => ({
      search,
      setSearch,
      activeSearchKey,
      setActiveSearchKey,
      searchResult,
      setSearchResult,
      reset: () => {
        setSearch('');
        setActiveSearchKey('');
        setSearchResult([]);
      },
    }),
    [activeSearchKey, search, searchResult]
  );

  // effects
  // 收集 search element DOM，需要等待DOM更新完成，因此需要nextTick
  useEffect(() => {
    updateSearchResult();
  }, [updateSearchResult]);

  // 定位到搜索高亮项，需要等待DOM更新完成，因此需要nextTick
  useEffect(() => {
    scrollIntoActiveSearchView();
  }, [scrollIntoActiveSearchView]);

  return { brickySearchValues, updateSearchResult, scrollIntoActiveSearchView };
}
