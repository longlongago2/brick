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
