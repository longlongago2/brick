import { Editor, Element, Transforms, Range } from 'slate';
import { TEXT_ALIGN_TYPES, NO_EFFECT_WRAP_TYPES, LIST_TYPES } from './constant';
import { isPowerObject } from '.';
import type { Text, Node, LinkElement, MarkKeys, ElementKeys } from 'slate';
import type { TextAlign, NoEffectWrapTypes } from './constant';

export interface CommandEditor {
  isMarkActive: (name: MarkKeys) => boolean;
  toggleMark: (name: MarkKeys) => void;
  isElementActive: (type: string, condition?: Record<string, any>) => boolean;
  toggleElement: (type: NoEffectWrapTypes) => void;
  toggleAlign: (align: TextAlign) => void;
  getElementValue: (key: ElementKeys) => any;
  setLink: (url: string) => void;
  unsetLink: () => void;
}

/**
 * @description Commands: 在实例上新增一些常用的命令
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

  e.toggleMark = (name) => {
    const isActive = e.isMarkActive(name);
    if (isActive) {
      Editor.removeMark(editor, name);
    } else {
      Editor.addMark(editor, name, true);
    }
  };

  e.isElementActive = (type, condition) => {
    const { selection } = editor;
    if (!selection) return false;
    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) => {
          const baseCondition = !Editor.isEditor(n) && Element.isElement(n) && n.type === type;
          if (condition && isPowerObject(condition)) {
            let extraCondition = true;
            Object.keys(condition).forEach((key) => {
              extraCondition = extraCondition && n[key as keyof Node] === condition[key];
            });
            return baseCondition && extraCondition;
          }
          return baseCondition;
        },
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
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && LIST_TYPES.includes(n.type) && n.type === type,
      split: true,
    });
    // 2.普通Element直接修改type
    const newProperties: Partial<Element> = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : type,
    };
    Transforms.setNodes(editor, newProperties);
    // 3.ListItem 需要添加 Wrap List
    if (!isActive && isList) {
      const block = { type, children: [] };
      Transforms.wrapNodes(editor, block as Element);
    }
  };

  e.toggleAlign = (align) => {
    if (!TEXT_ALIGN_TYPES.includes(align)) return;
    const prev = e.getElementValue('align');
    const newProperties = {
      align: prev ? undefined : align,
    };
    Transforms.setNodes(editor, newProperties);
  };

  e.getElementValue = (key) => {
    const { selection } = editor;
    if (!selection) return null;
    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) => !Editor.isEditor(n) && Element.isElement(n),
      })
    );
    const ele = match[0];
    return ele?.[key as keyof Node];
  };

  e.setLink = (url) => {
    const isActive = e.isElementActive('link');
    if (isActive) {
      e.unsetLink();
    }
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

  return e;
}
