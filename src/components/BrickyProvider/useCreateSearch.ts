import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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

  // brickySearchValues
  const [search, setSearch] = useState('');

  const [activeSearchKey, setActiveSearchKey] = useState('');

  const [searchResult, setSearchResult] = useState<SearchResult[]>([]);

  // handlers
  /**
   * @description 更新搜索结果: 通过收集 search result element，为确保DOM更新完成，因此需要在useEffect中执行，或者通过nextTick延迟执行
   */
  const updateSearchResult = useCallback(() => {
    if (search) {
      const _editor = editorFn.current();
      const nodes = _editor.getEditableSearchResult();
      setSearchResult(nodes);
    }
  }, [search]);

  /**
   * @description 搜索高亮highlight element scrollIntoView: 为确保DOM更新完成，因此需要在useEffect中执行，或者通过nextTick延迟执行
   */
  const scrollIntoActiveSearchView = useCallback(() => {
    if (activeSearchKey) {
      const _editor = editorFn.current();
      const textbox = _editor.getEditableDOM();
      const ele = textbox.querySelector(`mark[data-slate-decorate-search-key="${activeSearchKey}"]`);
      ele?.scrollIntoView();
    }
  }, [activeSearchKey]);

  const reset = useCallback(() => {
    setSearch('');
    setActiveSearchKey('');
    setSearchResult([]);
  }, []);

  // memoized
  const brickySearchValues = useMemo(
    () => ({
      search,
      setSearch,
      activeSearchKey,
      setActiveSearchKey,
      searchResult,
      setSearchResult,
      reset,
    }),
    [activeSearchKey, reset, search, searchResult]
  );

  // effects
  useEffect(() => {
    updateSearchResult();
  }, [updateSearchResult]);

  useEffect(() => {
    scrollIntoActiveSearchView();
  }, [scrollIntoActiveSearchView]);

  return { brickySearchValues, updateSearchResult, scrollIntoActiveSearchView };
}
