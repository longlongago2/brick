import { useCallback } from 'react';
import { Editor } from '../src'; // '../src' is 'bricky'

import type { Descendant } from 'slate';
import type { EditorProps } from '../src/components/Editor';

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
        width: 100,
        height: 100,
        inline: true,
        source: 'remote',
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
    source: 'remote',
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
        text: '4.这是被锁定的段落，不可操作，右键可解除锁定。',
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

  // const handleFileUpload = useCallback<NonNullable<EditorProps['fileUpload']>>((file) => {
  //   // TODO: 模拟上传file，并返回最终的地址
  //   console.log(file);
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve(
  //         'https://img1.baidu.com/it/u=184851089,3620794628&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'
  //       );
  //     }, 350);
  //   });
  // }, []);

  const handleKeyboard = useCallback(() => {
    // ...此处处理键盘事件
    // returning true, 阻止默认内置键盘处理程序
    // returning false, 执行内置快捷键
    return false; // is preventDefaultHandler
  }, []);

  // const handleChange = useCallback((v: Descendant[]) => {
  //   console.log(v);
  // }, []);

  return (
    <div>
      <Editor
        initialValue={initialValue}
        renderElement={renderElement}
        readOnly={false}
        // fileUpload={handleFileUpload}
        onKeyboard={handleKeyboard}
        // onChange={handleChange}
      />
    </div>
  );
}

export default App;
