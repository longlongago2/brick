import { ReactEditor } from 'slate-react';
import type { Editor, BaseRange } from 'slate';
import type { SearchEditor, SearchNode } from '../types';

export class SearchHighlight {
  private editor: Editor;

  private _text: string;

  private _activeSearchKey: string;

  private searchResult: SearchNode[];

  constructor(editor: Editor) {
    this.editor = editor;
    this._text = '';
    this._activeSearchKey = '';
    this.searchResult = [];
  }

  public set text(value: string) {
    this._text = value;
    // 强制更新
    this.editorForceUpdate();
    // 设置搜索关键字时, 重新收集搜索结果
    setTimeout(() => {
      this.searchResult = this.collectSearchResult();
    }, 0);
  }

  public get text() {
    return this._text;
  }

  public set activeSearchKey(value: string) {
    this._activeSearchKey = value;
    // 强制更新
    this.editorForceUpdate();
    // 高亮并滚动到搜索结果
    setTimeout(() => {
      this.highlightWithScrollIntoActiveSearchView();
    }, 0);
  }

  public get activeSearchKey() {
    return this._activeSearchKey;
  }

  public getSearchResult() {
    return this.searchResult;
  }

  public createSearchMark(key: string) {
    return {
      highlight: {
        color: '#ffff00',
        search: {
          key,
          activeColor: '#ff9632',
        },
      },
    };
  }

  public reset() {
    this.text = '';
    this.activeSearchKey = '';
    this.searchResult = [];
  }

  private editorForceUpdate() {
    console.log('force update');
  }

  private highlightWithScrollIntoActiveSearchView() {
    if (!this.activeSearchKey) return;
    const textbox = this.editor.getEditableDOM();
    const ele = textbox.querySelector(`mark[data-slate-decorate-search-key="${this.activeSearchKey}"]`);
    ele?.scrollIntoView();
  }

  private collectSearchResult() {
    const textbox = this.editor.getEditableDOM();
    const res = textbox.querySelectorAll('mark[data-slate-decorate-search-key]');
    const nodes = Array.from(res).map((ele) => {
      const key = ele.getAttribute('data-slate-decorate-search-key') ?? '';
      const node = ReactEditor.toSlateNode(this.editor, ele);
      const search = ele.textContent ?? '';
      // 获取搜索结果dom所处的Range并转换成SlateRange
      const domRange = document.createRange();
      domRange.setStart(ele, 0);
      domRange.setEnd(ele, 0);
      const range = ReactEditor.toSlateRange(this.editor, domRange, {
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
  }
}

function withSearch<T extends Editor>(editor: T) {
  const e = editor as T & SearchEditor;

  e.search = new SearchHighlight(editor);

  return e;
}

export default withSearch;
