import React, { memo, useCallback, useMemo } from 'react';
import { Editable, useSlate, ReactEditor } from 'slate-react';
import { Range, Transforms, Editor, Element as SlateElement } from 'slate';
import isHotkey, { isKeyHotkey } from 'is-hotkey';
import classNames from 'classnames';
import { HOTKEYS } from '../../utils/constant';
import { useSearchDecorate } from '../../hooks';
import useBaseResolver from '../Toolbar/useBaseResolver';
import Leaf from '../Leaf';
import Element from '../Element';
import useStyled from './styled';

import type { RenderLeafProps, RenderElementProps } from 'slate-react';
import type { NoEffectWrapTypes } from '../../types';

export interface ContentProps {
  className?: string;
  wrapperClassName?: string;
  placeholder?: string;
  spellCheck?: boolean;
  autoFocus?: boolean;
  readOnly?: boolean;
  style?: React.CSSProperties;
  renderLeaf?: (props: RenderLeafProps, leaf: JSX.Element) => JSX.Element;
  renderElement?: (props: RenderElementProps, element: JSX.Element) => JSX.Element;
  onKeyboard?: (event: React.KeyboardEvent<HTMLDivElement>) => boolean;
}

function Content(props: ContentProps) {
  const {
    className,
    wrapperClassName,
    placeholder,
    spellCheck,
    autoFocus,
    readOnly,
    style,
    renderLeaf,
    renderElement,
    onKeyboard,
  } = props;

  const editor = useSlate();

  const decorate = useSearchDecorate();

  const { wrapper, content } = useStyled();

  const baseResolver = useBaseResolver();

  const searchResolver = useMemo(() => baseResolver.find((item) => item.key === 'search'), [baseResolver]);

  const stepOutOfInlineEle = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const { selection } = editor;

      // 跳出行内元素边界：例如超链接，使用左右箭头键将跳出超链接作用范围。
      // Default left/right behavior is unit:'character'.
      // This fails to distinguish between two cursor positions, such as
      // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
      // Here we modify the behavior to unit:'offset'.
      // This lets the user step into and out of the inline without stepping over characters.
      // You may wish to customize this further to only use unit:'offset' in specific cases.
      if (selection && Range.isCollapsed(selection)) {
        const { nativeEvent } = event;
        if (isKeyHotkey('left', nativeEvent)) {
          event.preventDefault();
          Transforms.move(editor, { unit: 'offset', reverse: true });
          return;
        }
        if (isKeyHotkey('right', nativeEvent)) {
          event.preventDefault();
          Transforms.move(editor, { unit: 'offset' });
          return;
        }
      }
    },
    [editor]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      stepOutOfInlineEle(e);

      // 暴露接口：用户自定义行为
      if (onKeyboard) {
        // onKeyboard: e => true, 跳过内置快捷键处理
        // onKeyboard: e => false, 将执行后续内置快捷键
        const preventDefaultShortcut = onKeyboard(e);
        if (preventDefaultShortcut) return;
      }

      // 内置快捷键
      // Marks shortcut
      Object.keys(HOTKEYS.marks).forEach((hotkey) => {
        if (isHotkey(hotkey, e)) {
          e.preventDefault();
          const mark = HOTKEYS.marks[hotkey];
          editor.toggleMark(mark);
        }
      });
      // Nodes shortcut
      Object.keys(HOTKEYS.nodes).forEach((hotkey) => {
        if (isHotkey(hotkey, e)) {
          e.preventDefault();
          const type = HOTKEYS.nodes[hotkey] as NoEffectWrapTypes;
          editor.toggleElement(type);
        }
      });
      // Aligns shortcut
      Object.keys(HOTKEYS.aligns).forEach((hotkey) => {
        if (isHotkey(hotkey, e)) {
          e.preventDefault();
          const align = HOTKEYS.aligns[hotkey];
          editor.toggleAlign(align);
        }
      });
      // Search shortcut
      if (isHotkey('mod+f', e)) {
        e.preventDefault();
        // 征用Toolbar的弹窗渲染
        if (searchResolver && 'onClick' in searchResolver) {
          searchResolver.onClick?.(editor, null);
        }
      }
    },
    [editor, onKeyboard, searchResolver, stepOutOfInlineEle]
  );

  const receiveRenderLeaf = useCallback(
    (props: RenderLeafProps, leaf: JSX.Element) => {
      if (renderLeaf) return renderLeaf(props, leaf);
      return leaf;
    },
    [renderLeaf]
  );

  const receiveRenderElement = useCallback(
    (props: RenderElementProps, element: JSX.Element) => {
      if (renderElement) return renderElement(props, element);
      return element;
    },
    [renderElement]
  );

  // 处理文本级（行内元素）渲染
  const handleRenderLeaf = useCallback(
    (props: RenderLeafProps) => receiveRenderLeaf(props, <Leaf {...props} />),
    [receiveRenderLeaf]
  );

  // 处理节点级（块级元素）渲染
  const handleRenderElement = useCallback(
    (props: RenderElementProps) => receiveRenderElement(props, <Element {...props} />),
    [receiveRenderElement]
  );

  const preventDefaultDrop = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (e) => {
      let locked = false;
      // 注意：
      // editor.getElementFieldsValue('lock'); 获取的是拖动前的值，不是拖动放置目标的值，
      // 而此处需要获取放置区的锁定状态，因此不能使用该方法来获取是否锁定。
      // 因为 e.target 是放置目标的 document element
      // 所以此处根据 e.target 寻找 ParagraphElement，即可获取到放置区的锁定状态
      const node = ReactEditor.toSlateNode(editor, e.target as Node);
      const path = ReactEditor.findPath(editor, node);
      const [match] = Array.from(
        Editor.nodes(editor, {
          at: path,
          match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'paragraph',
        })
      );
      const element = match?.[0] as SlateElement;
      if ('lock' in element) {
        locked = !!element.lock;
      }
      if (locked) {
        // 阻止浏览器默认拖放
        e.stopPropagation();
        e.preventDefault();
      }
      // 是否阻止slate默认拖放
      // returning true, Slate will skip its own event handler
      // returning false, Slate will execute its own event handler afterward
      return locked;
    },
    [editor]
  );

  const preventDefaultDrag = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (e) => {
      const locked = !!editor.getElementFieldsValue('lock');
      // prevent its own event handler, avoiding conflicts with react-dnd.
      if (locked) {
        // 阻止浏览器默认拖动
        e.stopPropagation();
        e.preventDefault();
      }
      // 是否阻止slate默认拖动
      // returning true, Slate will skip its own event handler
      // returning false, Slate will execute its own event handler afterward
      return locked;
    },
    [editor]
  );

  return (
    <div role="document" className={classNames(wrapper, wrapperClassName)}>
      <Editable
        className={classNames(content, className)}
        role="textbox"
        placeholder={placeholder}
        spellCheck={spellCheck}
        autoFocus={autoFocus}
        readOnly={readOnly}
        style={style}
        decorate={decorate}
        renderLeaf={handleRenderLeaf}
        renderElement={handleRenderElement}
        onDragStart={preventDefaultDrag}
        onDrop={preventDefaultDrop}
        onKeyDown={handleKeyDown}
      />
      {searchResolver?.attachRender}
    </div>
  );
}

export default memo(Content);
