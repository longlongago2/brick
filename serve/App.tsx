import React, { useCallback } from 'react';
import { Editor } from 'bricky';

import type { Descendant } from 'slate';
import type { EditorProps } from 'bricky/components/Editor';

const initialValue: Descendant[] = [
  {
    type: 'heading-one',
    children: [
      {
        text: '标题一',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '1.这是一段带有行内图片的段落！',
      },
      {
        type: 'image',
        url: 'https://img2.baidu.com/it/u=4261212628,2246376874&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
        width: 200,
        height: 200,
        inline: true,
        children: [
          {
            text: '',
          },
        ],
      },
      {
        text: '',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '2.这是一段普通的段落文字！',
      },
    ],
  },
  {
    type: 'image',
    url: 'https://img1.baidu.com/it/u=184851089,3620794628&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
    width: 200,
    height: 200,
    children: [
      {
        text: '',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '3.这是一段普通的段落文字！',
      },
    ],
  },
  {
    type: 'paragraph',
    lock: true,
    children: [
      {
        text: '4.这是被冻结的段落，不可操作，右键可解除冻结。',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '5.A line of text in an paragraph.',
      },
    ],
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

  const handleChange = useCallback((v: Descendant[]) => {
    // console.log(v);
  }, []);

  return (
    <div>
      <Editor
        value={initialValue}
        renderElement={renderElement}
        readOnly={false}
        onKeyboard={handleKeyboard}
        onChange={handleChange}
      />
    </div>
  );
}

export default App;
