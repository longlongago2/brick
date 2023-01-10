import type { Element } from 'slate';
import type { DefinedType } from './constant';

/**
 * @description 判断是否是长度大于0的数组
 */
export const isPowerArray = (arr: unknown): arr is Array<unknown> => Array.isArray(arr) && arr.length > 0;

/**
 * @description 判断是否对象
 */
export const isObject = (obj: unknown): obj is Record<string, unknown> =>
  Object.prototype.toString.call(obj).indexOf('Object') > -1;

/**
 * @description 判断是否空对象
 */
export const isPowerObject = (obj: unknown): obj is Record<string, never> =>
  isObject(obj) && Object.keys(obj).length > 0;

/**
 * @description 判断目标是否存在
 */
export const isExist = (v: unknown): boolean => v !== undefined && v !== null && v !== '';

/**
 * @description 是否是有效值
 */
export const isPowerValue = (value: unknown): boolean => {
  if (isExist(value)) {
    if (Array.isArray(value)) return isPowerArray(value);
    if (isObject(value)) return isPowerObject(value);
    return true;
  }
  return false;
};

/**
 * @description 判断是否函数
 */
export const isFunction = (value: unknown): value is (...args: unknown[]) => unknown =>
  typeof value === 'function';

/**
 * @description 判断是否是浏览器
 */
export const isBrowser = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

/**
 * @description 是否是地址链接
 */
export const isUrl = (url: string) => {
  const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
  const localhostDomainRE = /^localhost[\\:?\d]*(?:[^\\:?\d]\S*)?$/;
  const nonLocalhostDomainRE = /^[^\s\\.]+\.\S{2,}$/;
  if (typeof url !== 'string') {
    return false;
  }
  const match = url.match(protocolAndDomainRE);
  if (!match) {
    return false;
  }
  const everythingAfterProtocol = match[1];
  if (!everythingAfterProtocol) {
    return false;
  }
  if (localhostDomainRE.test(everythingAfterProtocol) || nonLocalhostDomainRE.test(everythingAfterProtocol)) {
    return true;
  }
  return false;
};

/**
 * @description 判断是否是条件内的元素类型
 * @export
 * @param {Element} element 元素
 * @param {DefinedType[]} types 类型条件
 * @return {*}
 */
export function isIncludeElementTypes(element: Element, types: DefinedType[]) {
  return Boolean(
    types.find((type) => {
      if (typeof type === 'string') {
        return element.type === type;
      }
      const [_type, condition] = type;
      let selector = element.type === _type;
      Object.keys(condition).forEach((key) => {
        selector = selector && element[key as keyof Element] === condition[key];
      });
      return selector;
    })
  );
}

/**
 * @description 兼容性浏览器访问剪贴板
 * @export
 * @param {*} text
 * @return {*}
 */
export function copyToClipboard(text: string) {
  // 浏览器安全性限制，导致只有https安全域下才可以访问 navigator.clipboard
  // navigator clipboard api needs a secure context (https)
  if (navigator.clipboard && window.isSecureContext) {
    // navigator clipboard api method'
    return navigator.clipboard.writeText(text);
  }
  // text area method
  const textArea = document.createElement('textarea');
  textArea.value = text;
  // make the textarea out of viewport
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  return new Promise((resolve, reject) => {
    // here the magic happens
    const copied = document.execCommand('copy');
    if (copied) {
      resolve(text);
    } else {
      reject();
    }
    textArea.remove();
  });
}

/**
 * @description 获取滚动条宽度
 * @export
 * @return {*}
 */
export function getScrollBarWidth() {
  const scrollHeight = document.body.scrollHeight;
  const innerHeight = window.innerHeight || document.documentElement.clientHeight;
  const hasScrollbar = scrollHeight > innerHeight;
  if (!hasScrollbar) return 0;
  const outer = document.createElement('div');
  outer.style.overflow = 'scroll';
  outer.style.height = '200px';
  outer.style.width = '100px';
  document.body.appendChild(outer);
  const widthNoScroll = outer.offsetWidth;
  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);
  const widthWithScroll = inner.offsetWidth;
  const scrollBarWidth = widthNoScroll - widthWithScroll;
  outer.remove();
  return scrollBarWidth;
}
