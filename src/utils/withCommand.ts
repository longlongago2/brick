import { Editor, Element, Transforms, Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { TEXT_ALIGN_TYPES, NO_EFFECT_WRAP_TYPES, LIST_TYPES } from './constant';

import type { Text, Node, LinkElement, MarkKeys, ElementKeys, ParagraphElement } from 'slate';
import type { TextAlign, NoEffectWrapTypes } from './constant';

export interface CommandEditor {
  /**
   * @descriptionZH 标记类型是否处于激活状态
   * @descriptionEN
   * @memberof CommandEditor
   */
  isMarkActive: (name: MarkKeys) => boolean;

  /**
   * @descriptionZH 获取标记类型的属性值
   * @descriptionEN
   * @memberof CommandEditor
   */
  getMarkProperty: (name: MarkKeys) => any;

  /**
   * @descriptionZH 设置标记类型的属性值
   * @descriptionEN
   * @memberof CommandEditor
   */
  setMarkProperty: (name: MarkKeys, value: any) => void;

  /**
   * @descriptionZH 应用/取消标记类型
   * @descriptionEN
   * @memberof CommandEditor
   */
  toggleMark: (name: MarkKeys) => void;

  /**
   * @descriptionZH 某节点类型是否处于当前焦点
   * @descriptionEN
   * @memberof CommandEditor
   */
  isElementActive: (type: Element['type']) => boolean;

  /**
   * @descriptionZH 应用/取消某节点类型
   * @descriptionEN
   * @memberof CommandEditor
   */
  toggleElement: (type: NoEffectWrapTypes) => void;

  /**
   * @descriptionZH 应用/取消该文本对齐方式
   * @descriptionEN
   * @memberof CommandEditor
   */
  toggleAlign: (align: TextAlign) => void;

  /**
   * @descriptionZH 开启/关闭当前节点锁定状态
   * @descriptionEN
   * @memberof CommandEditor
   */
  toggleLock: (type: Element['type']) => void;

  /**
   * @descriptionZH 开启/关闭节点拖动。options.draggable：强制设置当前状态；options.unique: 状态唯一，即清除焦点外所有拖动状态，只应用焦点下的拖动状态
   * @descriptionEN Turn on/off node draggable state
   * @memberof CommandEditor
   */
  toggleDraggable: (type: Element['type'], options?: { unique?: boolean; draggable?: boolean }) => void;

  /**
   * @descriptionZH 获取指定节点的信息
   * @descriptionEN
   * @memberof CommandEditor
   */
  getElementFieldsValue: (fields?: ElementKeys | ElementKeys[], type?: Element['type']) => any;

  /**
   * @descriptionZH 设置超链接，如果已存在超链接则更新，否则新增
   * @descriptionEN set hyperlink
   * @memberof CommandEditor
   */
  setLink: (url: string) => void;

  /**
   * @descriptionZH 取消超链接
   * @descriptionEN cancel hyperlink
   * @memberof CommandEditor
   */
  unsetLink: () => void;

  /**
   * @descriptionZH 获取当前selection的DOMRect对象，其提供了selection的大小及其相对于视口的位置，常用于定位。
   * @descriptionEN
   * @memberof CommandEditor
   */
  getBoundingClientRect: () => DOMRect | null;

  /**
   * @descriptionZH 挂载在实例上的一些额外的属性
   * @descriptionEN some extra attributes on the instance
   * @type {Record<string, any>}
   * @memberof CommandEditor
   */
  extraProperty?: Record<string, any>;

  /**
   * @descriptionZH 添加额外属性
   * @descriptionEN Add an extra attribute
   * @memberof CommandEditor
   */
  addExtraProperty: (key: string, value: any) => void;

  /**
   * @descriptionZH 移除实例上指定的额外属性
   * @descriptionEN Remove extra attributes specified on the instance
   * @memberof CommandEditor
   */
  removeExtraProperty: (key: string) => void;

  /**
   * @descriptionZH 判断全文是否存在可拖动节点
   * @descriptionEN Determine whether the editor has draggable nodes
   * @memberof CommandEditor
   */
  hasDraggableNodes: () => boolean;
}

/**
 * @descriptionZH 命令方法: 在实例上新增一些常用的命令
 * @descriptionEN Commands: Add some commonly used commands on the editor instance
 * @export
 * @template T
 * @param {T} editor
 * @return {*}
 */
export function withCommand<T extends Editor>(editor: T) {
  const e = editor as T & CommandEditor;

  e.isMarkActive = (name) => {
    const marks = Editor.marks(editor);
    return Boolean(marks?.[name as keyof Omit<Text, 'text'>]);
  };

  e.getMarkProperty = (name) => {
    const marks = Editor.marks(editor);
    return marks?.[name as keyof Omit<Text, 'text'>];
  };

  e.toggleMark = (name) => {
    const isActive = e.isMarkActive(name);
    if (isActive) {
      Editor.removeMark(editor, name);
    } else {
      Editor.addMark(editor, name, true);
    }
  };

  e.setMarkProperty = (name, value) => {
    const isActive = e.isMarkActive(name);
    if (isActive) Editor.removeMark(editor, name);
    Editor.addMark(editor, name, value);
  };

  e.isElementActive = (type) => {
    const { selection } = editor;
    if (!selection) return false;
    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) => !Editor.isEditor(n) && Element.isElement(n) && n.type === type,
      })
    );
    return !!match;
  };

  e.toggleElement = (type) => {
    if (!NO_EFFECT_WRAP_TYPES.includes(type)) return;
    const isActive = e.isElementActive(type);
    const isList = LIST_TYPES.includes(type);
    // 1.如果是List, 需要删除 ListItem wrap
    Transforms.unwrapNodes(editor, {
      match: (n) => !Editor.isEditor(n) && Element.isElement(n) && LIST_TYPES.includes(n.type),
      split: true,
    });
    // 2.普通Element直接修改type
    const newProperties = {
      type: (isActive ? 'paragraph' : isList ? 'list-item' : type) as Element['type'],
    };
    Transforms.setNodes(editor, newProperties);
    // 3.ListItem 需要添加 Wrap List
    if (!isActive && isList) {
      const block = { type, children: [] };
      Transforms.wrapNodes(editor, block);
    }
  };

  e.toggleAlign = (align) => {
    if (!TEXT_ALIGN_TYPES.includes(align)) return;
    const res = e.getElementFieldsValue(['align', 'type']);
    let prevAlign = res?.[0];
    const type = res?.[1];
    const isList = LIST_TYPES.includes(type);
    if (isList) {
      // list比较特殊，getElementFieldsValue 直接获取的是list的值，但其实真正控制align的是list-item
      prevAlign = e.getElementFieldsValue('align', 'list-item');
    }
    const isActive = prevAlign === align;
    const newProperties = {
      align: isActive ? undefined : align,
    };
    Transforms.setNodes(editor, newProperties);
  };

  e.toggleLock = (type) => {
    const { selection } = editor;
    if (!selection) return null;
    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) => !Editor.isEditor(n) && Element.isElement(n) && n.type === type,
      })
    );
    const element = match?.[0] as Element;
    if (!element) return;

    const isInline = e.isInline(element);
    if (isInline) return; // 只有Block元素才可以lock

    let prevLock;
    if ('lock' in element) {
      prevLock = element.lock;
    }
    const newProperties = {
      lock: !prevLock,
    };
    Transforms.setNodes(editor, newProperties);
  };

  e.getElementFieldsValue = (fields, type) => {
    const { selection } = editor;
    if (!selection) return null;
    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) => {
          const baseMatch = !Editor.isEditor(n) && Element.isElement(n);
          if (type) {
            return baseMatch && n.type === type;
          }
          return baseMatch;
        },
      })
    );
    const ele = match?.[0];
    if (!ele) return null;
    if (fields) {
      // 根据fields，返回不同的数据格式
      if (Array.isArray(fields)) {
        // 多个字段值组成的数组
        return fields.map((key) => ele[key as keyof Node]);
      }
      // 单个字段值
      return ele[fields as keyof Node];
    }
    // fields is undefined, return all element data
    return ele;
  };

  e.setLink = (url) => {
    const isActive = e.isElementActive('link');
    if (isActive) {
      // update: update node's url and keep text
      Transforms.setNodes(
        editor,
        { url },
        {
          match: (n) => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'link',
        }
      );
      return;
    }
    // insert
    const { selection } = editor;
    const isCollapsed = selection && Range.isCollapsed(selection);
    const link: LinkElement = {
      type: 'link',
      url,
      children: isCollapsed ? [{ text: url }] : [],
    };

    if (isCollapsed) {
      Transforms.insertNodes(editor, link);
    } else {
      Transforms.wrapNodes(editor, link, { split: true });
      Transforms.collapse(editor, { edge: 'end' });
    }
  };

  e.unsetLink = () => {
    Transforms.unwrapNodes(editor, {
      match: (n) => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'link',
    });
  };

  e.toggleDraggable = (type, options) => {
    const { unique, draggable } = options || {};
    const { selection } = editor;
    if (!selection) return null;
    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) => !Editor.isEditor(n) && Element.isElement(n) && n.type === type,
      })
    );
    const element = match?.[0] as Element;
    if (!element) return;

    let prevDraggable;
    if ('draggable' in element) {
      prevDraggable = element.draggable;
    }
    const newProperties = {
      draggable: draggable ?? !prevDraggable,
    };

    if (unique) {
      // clear all draggable
      Transforms.setNodes(
        editor,
        { draggable: false },
        {
          at: [],
          match: (n) => !Editor.isEditor(n) && Element.isElement(n) && n.type === type,
        }
      );
    }
    // set new draggable
    Transforms.setNodes(editor, newProperties);
  };

  e.getBoundingClientRect = () => {
    if (!editor.selection) return null;
    const range = ReactEditor.toDOMRange(editor, editor.selection);
    return range.getBoundingClientRect();
  };

  e.addExtraProperty = (key, value) => {
    if (editor.extraProperty) {
      editor.extraProperty[key] = value;
    } else {
      editor.extraProperty = { [key]: value };
    }
  };

  e.removeExtraProperty = (key) => {
    if (editor.extraProperty) {
      delete editor.extraProperty[key];
    }
  };

  e.hasDraggableNodes = () => {
    const [match] = Array.from(
      Editor.nodes(editor, {
        at: [], // whole editor
        match: (n) => {
          return !Editor.isEditor(n) && Element.isElement(n) && !!(n as ParagraphElement).draggable;
        },
      })
    );
    const ele = match?.[0];
    return !!ele;
  };

  return e;
}
