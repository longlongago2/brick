import { jsx } from 'slate-hyperscript';

import type { ImageElement, LinkElement } from 'slate';

export const mapElementToJSON: Record<HTMLElement['nodeName'], any> = {
  A: (el: HTMLLinkElement): LinkElement => ({
    type: 'link',
    url: el.getAttribute('href') ?? '',
    children: [{ text: '' }],
  }),
  BLOCKQUOTE: () => ({ type: 'quote' }),
  H1: () => ({ type: 'heading-one' }),
  H2: () => ({ type: 'heading-two' }),
  H3: () => ({ type: 'heading-three' }),
  H4: () => ({ type: 'heading-four' }),
  H5: () => ({ type: 'heading-five' }),
  H6: () => ({ type: 'heading-six' }),
  IMG: (el: HTMLImageElement): ImageElement => {
    const url = el.getAttribute('src');
    const width = el.getAttribute('width');
    const height = el.getAttribute('height');
    const inline = el.getAttribute('data-element');
    return {
      type: 'image',
      source: 'remote',
      url: url ?? '',
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      inline: inline ? inline === 'inline' : undefined,
      children: [{ text: '' }],
    };
  },
  LI: () => ({ type: 'list-item' }),
  OL: () => ({ type: 'numbered-list' }),
  P: () => ({ type: 'paragraph' }),
  PRE: () => ({ type: 'code' }),
  UL: () => ({ type: 'bulleted-list' }),
};

export const mapMarkToJSON: Record<HTMLElement['nodeName'], any> = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
};

/**
 * @description 判断是否是换行node节点：在DOM中，块级元素之间会存在一个换行符，有的浏览器会将它解释为#text节点
 * @export
 * @param {Node} node
 * @returns {boolean}
 */
export const isFragmentWrapTextNode = (node: Node) => {
  const isWrapText = node.textContent && node.textContent.split('\n').filter(Boolean).length === 0;
  if (isWrapText && !node.previousSibling && node.nextSibling) {
    return true;
  }
  if (isWrapText && !node.nextSibling && node.previousSibling) {
    return true;
  }
  return false;
};

/**
 * @description 反序列化：将 HTML 解析成 JSON
 * @export
 * @param {Node} el
 * @returns {*}
 */
export const deserialize = (el: Node) => {
  if (el.nodeType === window.Node.TEXT_NODE) {
    if (isFragmentWrapTextNode(el)) {
      return null;
    }
    return el.textContent;
  }
  if (el.nodeType !== window.Node.ELEMENT_NODE) {
    return null;
  }
  if (el.nodeName === 'BR') {
    return '\n';
  }

  // ELEMENT_NODE
  const { nodeName } = el;
  let parent = el;

  if (nodeName === 'PRE' && el.childNodes[0] && el.childNodes[0].nodeName === 'CODE') {
    parent = el.childNodes[0];
  }

  let children: any[] = Array.from(parent.childNodes).map(deserialize).flat();

  if (children.length === 0) {
    children = [{ text: '' }];
  }

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }

  if (mapElementToJSON[nodeName]) {
    const attrs = mapElementToJSON[nodeName](el);
    return jsx('element', attrs, children);
  }

  if (mapMarkToJSON[nodeName]) {
    const attrs = mapMarkToJSON[nodeName](el);
    return children.map((child) => jsx('text', attrs, child));
  }

  return children;
};
