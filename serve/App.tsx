import React, { useCallback } from 'react';
import { Editor } from 'brick';

import type { Descendant } from 'slate';
import type { EditorProps } from 'brick/components/Editor';

const initialValue: Descendant[] = [
  {
    type: 'heading-one',
    children: [{ text: '标题一' }],
  },
  {
    type: 'paragraph',
    children: [{ text: '1.这是一段普通的段落文字！' }],
  },
  {
    type: 'paragraph',
    children: [{ text: '2.这是一段普通的段落文字！' }],
  },
  {
    type: 'paragraph',
    children: [{ text: '3.这是一段普通的段落文字！' }],
  },
  {
    type: 'paragraph',
    lock: true,
    children: [{ text: '4.这是被冻结的段落，不可操作，右键可解除冻结。' }],
  },
  {
    type: 'paragraph',
    children: [{ text: '5.A line of text in an paragraph.' }],
  },
];

function App() {
  const renderElement = useCallback<NonNullable<EditorProps['renderElement']>>((props, element) => {
    // TODO: ...此处可根据props数据处理自定义渲染模板
    return element; // 继承原始的渲染模板
  }, []);

  return (
    <div>
      <Editor value={initialValue} renderElement={renderElement} readOnly={false} />
    </div>
  );
}

export default App;
