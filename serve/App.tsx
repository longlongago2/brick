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
    // ...此处可根据props数据处理自定义渲染模板
    return element; // 继承原始的渲染模板
  }, []);

  const handleKeyboard = useCallback(() => {
    // ...此处处理键盘事件
    // returning true, 阻止默认内置键盘处理程序
    // returning false, 执行内置快捷键
    return false; // is preventDefaultHandler
  }, []);

  return (
    <div>
      <Editor
        value={initialValue}
        renderElement={renderElement}
        readOnly={false}
        onKeyboard={handleKeyboard}
      />
    </div>
  );
}

export default App;
