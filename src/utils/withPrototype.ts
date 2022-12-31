import { Transforms } from 'slate';
import { INLINE_TYPES, VOID_TYPES } from './constant';
import { deserialize } from './transformDOMToJSON';
import { isUrl, isIncludeElementTypes } from '.';

import type { Editor, Node } from 'slate';

/**
 * @description 修改内置的实例方法，在原有的实例方法上修改，并继承原有的方法
 * @export
 * @template T
 * @param {T} editor
 */
export function withPrototype<T extends Editor>(editor: T) {
  const { insertData, insertText, isInline, isVoid } = editor;

  // 此处增加自定义的行内元素 Inline Element
  editor.isInline = (element) => {
    return isIncludeElementTypes(element, INLINE_TYPES) || isInline(element);
  };

  // 此处增加自定义的虚空元素 Void Element, children 是 占位组件
  editor.isVoid = (element) => {
    return isIncludeElementTypes(element, VOID_TYPES) || isVoid(element);
  };

  // 处理外部纯文本复制粘贴
  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      editor.setLink(text);
      return;
    }
    insertText(text);
  };

  // 处理外部复杂数据复制粘贴
  editor.insertData = (data) => {
    const html = data.getData('text/html');
    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const fragment = deserialize(parsed.body) as Node[]; // 自定义解析内容 deserialize -> ELEMENT_TAGS
      Transforms.insertFragment(editor, fragment);
      return;
    }
    insertData(data);
  };

  return editor;
}
