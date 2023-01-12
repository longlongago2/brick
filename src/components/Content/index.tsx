import React, { memo, useCallback, useMemo } from 'react';
import { Editable, useSlate, ReactEditor } from 'slate-react';
import { Range, Transforms, Editor, Element as SlateElement, Text } from 'slate';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import isHotkey, { isKeyHotkey } from 'is-hotkey';
import classNames from 'classnames';
import { HOTKEYS } from 'src/utils/constant';
import { useAccessories } from 'src/hooks';
import useBaseResolver from '../Toolbar/useBaseResolver';
import Leaf from '../Leaf';
import Element from '../Element';
import useStyled from './styled';

import type { BaseRange, MarkText } from 'slate';
import type { RenderLeafProps, RenderElementProps } from 'slate-react';
import type { EditableProps } from 'slate-react/dist/components/editable';
import type { NoEffectWrapTypes } from 'src/utils/constant';

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

type DecorateRange = BaseRange & Omit<MarkText, 'text'>;

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

  const { search } = useAccessories();

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

  // 装饰器
  const decorate = useCallback<NonNullable<EditableProps['decorate']>>(
    ([node, path]) => {
      const ranges: DecorateRange[] = [];

      if (search && Text.isText(node)) {
        const { text } = node;
        const parts = text.split(search);
        let offset = 0;

        parts.forEach((part, i) => {
          if (i !== 0) {
            const uuid = Math.random().toString(36).slice(2);
            ranges.push({
              anchor: { path, offset: offset - search.length },
              focus: { path, offset },
              highlight: { color: '#ffff00', searchkey: uuid }, // MarkText properties 搜索利用高亮属性高亮搜索内容
            });
          }

          offset = offset + part.length + search.length;
        });
      }

      return ranges;
    },
    [search]
  );

  const preventDefaultDrop = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (e) => {
      // returning true, Slate will skip its own event handler
      // returning false, Slate will execute its own event handler afterward
      let locked = false;
      const hasReactDnd = editor.hasDraggableNodes();
      // 因为此处 editor.getElementFieldsValue('lock'); 获取的是拖动前的值，不是放置目标的值
      // 所以此处根据 document element(e.target) 寻找 slate element(ParagraphElement)
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
      // 阻止slate默认拖放
      return hasReactDnd || locked;
    },
    [editor]
  );

  const preventDefaultDrag = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (e) => {
      // returning true, Slate will skip its own event handler
      // returning false, Slate will execute its own event handler afterward
      const hasReactDnd = editor.hasDraggableNodes();
      const locked = !!editor.getElementFieldsValue('lock');
      // prevent its own event handler, avoiding conflicts with react-dnd.
      if (locked) {
        // 阻止浏览器默认拖动
        e.stopPropagation();
        e.preventDefault();
      }
      // 阻止slate默认拖动
      return hasReactDnd || locked;
    },
    [editor]
  );

  return (
    <DndProvider backend={HTML5Backend}>
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
    </DndProvider>
  );
}

export default memo(Content);
