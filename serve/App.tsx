import React, { useCallback } from 'react';
import { Editor } from 'brick';

import type { Descendant } from 'slate';
import type { RenderElementProps } from 'slate-react';

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
  {
    type: 'paragraph',
    lock: true,
    children: [{ text: 'A line of text in an locked paragraph.' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in an paragraph.' }],
  },
];

function App() {
  const renderElement = useCallback((props: RenderElementProps, resolver: JSX.Element) => {
    // ...此处可处理自定义渲染模板
    return resolver; // 继承原始的渲染模板
  }, []);

  return (
    <div>
      <Editor value={initialValue} renderElement={renderElement} readOnly={false} />
    </div>
  );
}

export default App;
