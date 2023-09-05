import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ReactEditor } from 'slate-react';
import { useNextTick } from '.';
import type { Editor, BaseRange, AdvancedHighlight } from 'slate';
import type { SlateSearch, SearchNode } from '../types';

const defaultValue: SlateSearch = {
  setKeyword: () => void 0,
  setActiveKey: () => void 0,
  reset: () => void 0,
  forceCollectSearchResult: () => void 0,
  getState: () => ({ keyword: '', activeKey: '', results: [] }),
  createSearchMark: () => ({ highlight: {} as AdvancedHighlight }),
};

/**
 * @description 搜索功能上下文
 */
export const SlateSearchCxt = React.createContext(defaultValue);

/**
 * @description 搜索功能上下文数据提供者
 */
export const SlateSearchProvider = SlateSearchCxt.Provider;

/**
 * @description 创建搜索功能上下文数据
 */
export function useCreateSearch(editor: Editor): SlateSearch {
  const editorRef = useRef<Editor>(editor);

  editorRef.current = editor;

  const nextTick = useNextTick();

  const [keyword, setKeyword] = useState('');

  const [activeKey, setActiveKey] = useState('');

  const [results, setResults] = useState<SearchNode[]>([]);

  const _collectSearchResult = useCallback(() => {
    const _editor = editorRef.current;
    if (!_editor) return [];
    if (!keyword) return [];
    const textbox = _editor.getEditableDOM();
    const res = textbox.querySelectorAll('mark[data-slate-decorate-search-key]');
    const nodes = Array.from(res).map((ele) => {
      const key = ele.getAttribute('data-slate-decorate-search-key') ?? '';
      const node = ReactEditor.toSlateNode(_editor, ele);
      const search = ele.textContent ?? '';
      // 获取搜索结果dom所处的Range并转换成SlateRange
      const domRange = document.createRange();
      domRange.setStart(ele, 0);
      domRange.setEnd(ele, 0);
      const range = ReactEditor.toSlateRange(_editor, domRange, {
        exactMatch: false,
        suppressThrow: true,
      }) as BaseRange;
      return {
        key,
        search, // 搜索关键字
        node, // 搜索结果所处的Node
        range, // 搜索结果所处的Range
      };
    });
    return nodes;
  }, [keyword]);

  const _scrollIntoActiveSearchView = useCallback(() => {
    const _editor = editorRef.current;
    if (!_editor) return;
    if (!activeKey) return;
    const textbox = _editor.getEditableDOM();
    const ele = textbox.querySelector(`mark[data-slate-decorate-search-key="${activeKey}"]`);
    ele?.scrollIntoView();
  }, [activeKey]);

  useEffect(() => {
    // Scroll into active search view
    _scrollIntoActiveSearchView();
  }, [_scrollIntoActiveSearchView]);

  useEffect(() => {
    // Collect search result
    setResults(_collectSearchResult());
  }, [_collectSearchResult]);

  const slateSearch = useMemo(() => {
    return {
      setKeyword,
      setActiveKey,
      reset() {
        setKeyword('');
        setActiveKey('');
        setResults([]);
      },
      getState() {
        return {
          keyword,
          activeKey,
          results,
        };
      },
      forceCollectSearchResult() {
        // 等待 DOM 渲染完成，强制收集搜索结果
        nextTick(() => {
          setResults(_collectSearchResult());
        });
      },
      createSearchMark(key: string) {
        return {
          highlight: {
            color: '#ffff00',
            search: {
              key,
              activeColor: '#ff9632',
            },
          },
        };
      },
    };
  }, [keyword, activeKey, results, nextTick, _collectSearchResult]);

  return slateSearch;
}
