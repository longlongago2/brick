import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Editor, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import Icon, {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  AlignCenterOutlined,
  MenuOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  DisconnectOutlined,
  HighlightOutlined,
  FileSearchOutlined,
  RightOutlined,
  DownOutlined,
  FunctionOutlined,
} from '@ant-design/icons';
import { theme, Form, Input, Radio, message, InputNumber, Button, Space, Row, Col } from 'antd';
import debounce from 'lodash/debounce';
import { useFormDialog } from '../../hooks';
import { isPowerArray } from '../../utils';
import { LIST_TYPES } from '../../utils/constant';
import { useSlateSearch } from '../../package/slate-search';
import ColorPicker, { colorParse, colorStringify } from './ColorPicker';
import FormDialog from './FormDialog';
import FileUpload from '../FileUpload';
import { SvgrCode, SvgrImage, SvgrQuote, SvgrSubscript, SvgrSuperscript, SvgrUndo, SvgrRedo } from '../Icons';
import useStyled from './styled';

import type { ImageElement } from 'slate';
import type { Color } from 'react-color';
import type { ToolbarResolver } from '.';
import type { FormDialogProps } from './FormDialog';
import type { SearchNode } from '../../package/slate-search';

// TODO: 优化代码结构
// 1. 拆分代码，将render相关的代码拆分到单独的文件中
// 2. 修复FormDialog的位置问题：resize 和 初始化 不会更新位置和检测边界

const { useToken } = theme;

const span4 = { span: 4 };

const w88 = { width: 88 };

const pb24 = { paddingBottom: 24 };

const alignCenter: React.CSSProperties = { textAlign: 'center' };

const alignRight: React.CSSProperties = { textAlign: 'right', marginBottom: 0 };

const required = [{ required: true }];

const noMsgRequired = [{ required: true, message: '' }];

const imgSourceOptions = [
  {
    label: '本地上传',
    value: 'local',
  },
  {
    label: '远程图片',
    value: 'remote',
  },
];

const imgElementOptions = [
  {
    label: '行内元素',
    value: true,
  },
  {
    label: '块级元素',
    value: false,
  },
];

const defaultImgSource = 'local';

export default function useBaseResolver() {
  const editor = useSlate();

  const { token } = useToken();

  const { searchIndicator, linkButton, searchTypeButton, between, mp0, bold } = useStyled();

  const slateSearch = useSlateSearch();

  const { results: searchResult } = slateSearch.getState();

  const [imgSource, setImgSource] = useState(defaultImgSource);

  const [searchType, setSearchType] = useState<'search' | 'replace'>('search');

  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);

  const replaceType = useRef<'curr' | 'all' | null>(null);

  const {
    form: formLink,
    visible: linkDialogVisible,
    setVisible: setLinkDialogVisible,
    pos: linkDialogPos,
    setPos: setLinkDialogPos,
    close: closeLinkDialog,
    submit: submitLink,
  } = useFormDialog();

  const {
    form: formImage,
    visible: imageDialogVisible,
    setVisible: setImageDialogVisible,
    pos: imageDialogPos,
    setPos: setImageDialogPos,
    close: closeImageDialog,
    submit: submitImage,
    mode: imageDialogMode,
    setMode: setImageDialogMode,
    loading: imgDialogLoading,
  } = useFormDialog();

  const {
    form: formFormula,
    visible: formulaDialogVisible,
    setVisible: setFormulaDialogVisible,
    pos: formulaDialogPos,
    setPos: setFormulaDialogPos,
    close: closeFormulaDialog,
  } = useFormDialog();

  const {
    form: formSearch,
    visible: searchDialogVisible,
    setVisible: setSearchDialogVisible,
    pos: searchDialogPos,
    setPos: setSearchDialogPos,
    close: closeSearchDialog,
  } = useFormDialog();

  const handleLinkFinish = useCallback<NonNullable<FormDialogProps['onFinish']>>(
    (values) => {
      closeLinkDialog();
      const { url } = values;
      editor.setLink(url);
      ReactEditor.focus(editor);
    },
    [closeLinkDialog, editor]
  );

  const _closeImageDialog = useCallback(() => {
    setImgSource(defaultImgSource);
    closeImageDialog();
  }, [closeImageDialog]);

  const handleImageFinish = useCallback<NonNullable<FormDialogProps['onFinish']>>(
    async (values) => {
      const { source, file, url: _url, inline, width, height } = values;
      let url = _url;
      if (source === 'local') {
        const fileUpload = editor.extraProperty?.fileUpload;
        if (fileUpload) {
          url = await fileUpload(file);
        } else {
          // default base64
          url = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
              resolve(reader.result);
            };
            reader.onerror = function (error) {
              reject(error);
            };
          }).catch(() => '');
        }
      }
      if (imageDialogMode === 'update') {
        // 编辑
        editor.setElementProperties('image', { source, url, inline, width, height }, { refactor: true });
        _closeImageDialog();
        ReactEditor.focus(editor);
        return;
      }
      // 新增
      Transforms.insertNodes(editor, {
        type: 'image',
        source,
        url,
        inline,
        width,
        height,
        children: [{ text: '' }],
      });
      _closeImageDialog();
      ReactEditor.focus(editor);
    },
    [_closeImageDialog, editor, imageDialogMode]
  );

  const handleColorChange = useCallback(
    (v: Color) => {
      editor.setMarkProperty('color', colorStringify(v));
      ReactEditor.focus(editor);
    },
    [editor]
  );

  const handleHlColorChange = useCallback(
    (v: Color) => {
      editor.setMarkProperty('highlight', { color: colorStringify(v) });
      ReactEditor.focus(editor);
    },
    [editor]
  );

  const handleImageDialogValuesChange = useCallback<NonNullable<FormDialogProps['onValuesChange']>>(
    (changedValues) => {
      if (changedValues.source) {
        setImgSource(changedValues.source);
      }
    },
    []
  );

  const handleSearchTypeChange = useCallback(() => {
    setSearchType((v) => (v === 'search' ? 'replace' : 'search'));
    // clear errors
    formSearch.setFields([
      {
        name: 'search',
        errors: [],
      },
    ]);
  }, [formSearch]);

  // 上一个
  const handleSearchResultPrev = useCallback(() => {
    if (!isPowerArray(searchResult)) return;
    let next;
    if (activeSearchIndex === null) {
      next = 0;
    } else {
      next = activeSearchIndex - 1 >= 0 ? activeSearchIndex - 1 : searchResult.length - 1;
    }
    setActiveSearchIndex(next);
    const activeKey = searchResult[next]?.key || '';
    slateSearch.setActiveKey(activeKey);
  }, [activeSearchIndex, searchResult, slateSearch]);

  // 下一个
  const handleSearchResultNext = useCallback(() => {
    if (!isPowerArray(searchResult)) return;
    let next;
    if (activeSearchIndex === null) {
      next = 0;
    } else {
      next = activeSearchIndex + 1 > searchResult.length - 1 ? 0 : activeSearchIndex + 1;
    }
    setActiveSearchIndex(next);
    const activeKey = searchResult[next]?.key || '';
    slateSearch.setActiveKey(activeKey);
  }, [activeSearchIndex, searchResult, slateSearch]);

  // 替换
  const handleSearchOrReplaceFinish = useCallback<NonNullable<FormDialogProps['onFinish']>>(
    (values) => {
      if (!isPowerArray(searchResult)) return;
      const replaceText = (item: SearchNode) => {
        const { search, range } = item;
        const { anchor, focus } = range;
        const rangeDelete = {
          anchor,
          focus: {
            ...focus,
            offset: focus.offset + search.length,
          },
        };
        Transforms.delete(editor, { at: rangeDelete });
        Transforms.insertText(editor, values.replace, { at: range });
      };
      // 当前替换
      if (replaceType.current === 'curr') {
        if (activeSearchIndex === null || activeSearchIndex === undefined) return;
        const item = searchResult[activeSearchIndex];
        replaceText(item);
      }
      // 全部替换
      if (replaceType.current === 'all') {
        searchResult.forEach((item) => {
          replaceText(item);
        });
      }
      // 重置选中
      setActiveSearchIndex(null);
      // 重新收集搜索结果
      slateSearch.forceCollectSearchResult();
    },
    [activeSearchIndex, editor, searchResult, slateSearch]
  );

  const handleSearchValuesChange = useCallback<NonNullable<FormDialogProps['onValuesChange']>>(
    (changedValues) => {
      if (changedValues.search !== undefined) {
        slateSearch.setActiveKey('');
        slateSearch.setKeyword(changedValues.search);
        setActiveSearchIndex(null);
      }
    },
    [slateSearch]
  );

  const handleSearchOrReplaceValuesChange = useMemo(
    () => debounce(handleSearchValuesChange, 250),
    [handleSearchValuesChange]
  );

  const handleSearchDialogCancel = useCallback(() => {
    closeSearchDialog();
    // reset initial state
    setSearchType('search');
    setActiveSearchIndex(null);
    slateSearch.reset();
  }, [closeSearchDialog, slateSearch]);

  const handleReplaceCurr = useCallback(() => {
    replaceType.current = 'curr';
  }, []);

  const handleReplaceAll = useCallback(() => {
    replaceType.current = 'all';
  }, []);

  const handleTexHelpDocument = useCallback(() => {
    window.open(
      'https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference',
      '_blank'
    );
  }, []);

  const colorIcon = useMemo(
    () => <span style={{ display: 'inline-block', fontSize: 14, width: 13 }}>A</span>,
    []
  );

  const searchTypeIcon = useMemo(
    () => (searchType === 'search' ? <RightOutlined /> : <DownOutlined />),
    [searchType]
  );

  const defaultColor = useMemo(() => colorParse(token.colorText), [token.colorText]);

  const getFontColorElement = useCallback(
    (editor: Editor) => (
      <ColorPicker
        defaultValue={defaultColor}
        value={editor.getMarkProperty('color')}
        icon={colorIcon}
        title="应用字体颜色"
        onChange={handleColorChange}
        onClick={handleColorChange}
      />
    ),
    [colorIcon, defaultColor, handleColorChange]
  );

  const defaultHighlightColor = useMemo(() => colorParse(token.colorWarning), [token]);

  const resolveHighlight = useCallback(
    (editor: Editor) => {
      const v = editor.getMarkProperty('highlight');

      if (typeof v === 'boolean') {
        // default highlight color
        return defaultHighlightColor;
      }
      return v?.color;
    },
    [defaultHighlightColor]
  );

  const getHighlightElement = useCallback(
    (editor: Editor) => (
      <ColorPicker
        defaultValue={defaultHighlightColor}
        value={resolveHighlight(editor)}
        icon={<HighlightOutlined />}
        title="应用背景颜色"
        onChange={handleHlColorChange}
        onClick={handleHlColorChange}
      />
    ),
    [defaultHighlightColor, handleHlColorChange, resolveHighlight]
  );

  const baseResolver = useMemo<ToolbarResolver[]>(
    () => [
      {
        key: 'undo',
        type: 'button',
        icon: <Icon component={SvgrUndo} />,
        title: '撤销 Ctrl+Z',
        disabled: (editor) => editor.history.undos.length <= 0,
        onClick(editor) {
          editor.undo();
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'redo',
        type: 'button',
        icon: <Icon component={SvgrRedo} />,
        title: '重做 Shift+Ctrl+Z',
        disabled: (editor) => editor.history.redos.length <= 0,
        onClick(editor) {
          editor.redo();
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'bold',
        type: 'button',
        icon: <BoldOutlined />,
        title: '加粗 Ctrl+B',
        active: (editor) => editor.isMarkActive('bold'),
        onClick(editor) {
          editor.toggleMark('bold');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'italic',
        type: 'button',
        icon: <ItalicOutlined />,
        title: '倾斜 Ctrl+I',
        active: (editor) => editor.isMarkActive('italic'),
        onClick(editor) {
          editor.toggleMark('italic');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'linethrough',
        type: 'button',
        icon: <StrikethroughOutlined />,
        title: '删除线 Ctrl+Alt+S',
        active: (editor) => editor.isMarkActive('linethrough'),
        onClick(editor) {
          editor.toggleMark('linethrough');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'code',
        type: 'button',
        icon: <Icon component={SvgrCode} />,
        title: '行内代码 Ctrl+`',
        active: (editor) => editor.isMarkActive('code'),
        onClick(editor) {
          editor.toggleMark('code');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'underline',
        type: 'button',
        icon: <UnderlineOutlined />,
        title: '下划线 Ctrl+U',
        active: (editor) => editor.isMarkActive('underline'),
        onClick(editor) {
          editor.toggleMark('underline');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'superscript',
        type: 'button',
        icon: <Icon component={SvgrSuperscript} />,
        title: '上标 Ctrl+.',
        active: (editor) => editor.isMarkActive('superscript'),
        onClick(editor) {
          // 上标/下标 互斥
          const isActive = editor.isMarkActive('subscript');
          if (isActive) {
            Editor.removeMark(editor, 'subscript');
          }
          editor.toggleMark('superscript');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'subscript',
        type: 'button',
        icon: <Icon component={SvgrSubscript} />,
        title: '下标 Ctrl+,',
        active: (editor) => editor.isMarkActive('subscript'),
        onClick(editor) {
          // 上标/下标 互斥
          const isActive = editor.isMarkActive('superscript');
          if (isActive) {
            Editor.removeMark(editor, 'superscript');
          }
          editor.toggleMark('subscript');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'numbered-list',
        type: 'button',
        icon: <OrderedListOutlined />,
        title: '有序列表 Ctrl+Alt+O',
        active: (editor) => editor.isElementActive('numbered-list'),
        onClick(editor) {
          editor.toggleElement('numbered-list');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'bulleted-list',
        type: 'button',
        icon: <UnorderedListOutlined />,
        title: '无序列表 Ctrl+Alt+U',
        active: (editor) => editor.isElementActive('bulleted-list'),
        onClick(editor) {
          editor.toggleElement('bulleted-list');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'block-quote',
        type: 'button',
        icon: <Icon component={SvgrQuote} />,
        title: '引用块 Ctrl+Alt+Q',
        active: (editor) => editor.isElementActive('block-quote'),
        onClick(editor) {
          editor.toggleElement('block-quote');
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'format',
        type: 'dropdown',
        title: '正文与标题',
        placeholder: '无标题',
        width: 85,
        options: [
          {
            key: 'paragraph',
            label: '正文',
            renderLabel: (label) => <p className={mp0}>{label}</p>,
            extra: 'Ctrl+Alt+0',
          },
          {
            key: 'heading-one',
            label: '标题1',
            renderLabel: (label) => <h1 className={mp0}>{label}</h1>,
            extra: 'Ctrl+Alt+1',
          },
          {
            key: 'heading-two',
            label: '标题2',
            renderLabel: (label) => <h2 className={mp0}>{label}</h2>,
            extra: 'Ctrl+Alt+2',
          },
          {
            key: 'heading-three',
            label: '标题3',
            renderLabel: (label) => <h3 className={mp0}>{label}</h3>,
            extra: 'Ctrl+Alt+3',
          },
          {
            key: 'heading-four',
            label: '标题4',
            renderLabel: (label) => <h4 className={mp0}>{label}</h4>,
            extra: 'Ctrl+Alt+4',
          },
          {
            key: 'heading-five',
            label: '标题5',
            renderLabel: (label) => <h5 className={mp0}>{label}</h5>,
            extra: 'Ctrl+Alt+5',
          },
          {
            key: 'heading-six',
            label: '标题6',
            renderLabel: (label) => <h6 className={mp0}>{label}</h6>,
            extra: 'Ctrl+Alt+6',
          },
        ],
        activeKey: (editor) => editor.getElementFieldsValue('type'),
        onSelect(editor, v) {
          editor.toggleElement(v);
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'fontsize',
        type: 'dropdown',
        title: '字号调整',
        placeholder: '字号',
        width: 80,
        showOriginalOption: true,
        options: [
          {
            key: '12px',
            label: '12px',
          },
          {
            key: '13px',
            label: '13px',
          },
          {
            key: '14px',
            label: '14px',
          },
          {
            key: '15px',
            label: '15px',
          },
          {
            key: '16px',
            label: '16px',
          },
          {
            key: '19px',
            label: '19px',
          },
          {
            key: '22px',
            label: '22px',
          },
          {
            key: '24px',
            label: '24px',
          },
          {
            key: '29px',
            label: '29px',
          },
          {
            key: '32px',
            label: '32px',
          },
          {
            key: '40px',
            label: '40px',
          },
        ].map((item) => ({
          ...item,
          renderLabel: (label) => <span className={bold}>{label}</span>,
        })),
        activeKey: (editor) => editor.getMarkProperty('fontsize') || '16px',
        onSelect(editor, v) {
          editor.setMarkProperty('fontsize', v);
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'align',
        type: 'dropdown',
        title: '文本对齐',
        width: 60,
        optionDisplayField: 'icon',
        options: [
          {
            key: 'left',
            label: '左对齐',
            extra: 'Ctrl+Alt+L',
            icon: <AlignLeftOutlined />,
          },
          {
            key: 'right',
            label: '右对齐',
            extra: 'Ctrl+Alt+R',
            icon: <AlignRightOutlined />,
          },
          {
            key: 'center',
            label: '居中对齐',
            extra: 'Ctrl+Alt+C',
            icon: <AlignCenterOutlined />,
          },
          {
            key: 'justify',
            label: '两端对齐',
            extra: 'Ctrl+Alt+J',
            icon: <MenuOutlined />,
          },
        ],
        activeKey: (editor) => {
          const type = editor.getElementFieldsValue('type');
          const isList = LIST_TYPES.includes(type);
          if (isList) {
            // list比较特殊，因为有list-item，此判断逻辑适用于所有存在item的Node，
            // 所以需要注意可能有其他类型的嵌套，需要一并添加判断。
            // getElementFieldsValue 直接获取的是list的值，但其实真正控制align的是list-item
            // 需要指定具体类型，否则获取的是上层的数据
            return editor.getElementFieldsValue('align', 'list-item') || 'left';
          }
          return editor.getElementFieldsValue('align') || 'left';
        },
        onSelect(editor, v) {
          editor.toggleAlign(v);
          ReactEditor.focus(editor);
        },
      },
      {
        key: 'color',
        type: 'custom',
        title: '字体颜色',
        element: getFontColorElement,
      },
      {
        key: 'highlight',
        type: 'custom',
        title: '背景高亮',
        element: getHighlightElement,
      },
      {
        key: 'search',
        type: 'button',
        title: '查找替换 Ctrl+F',
        icon: <FileSearchOutlined />,
        attachRender: (
          <FormDialog
            form={formSearch}
            open={searchDialogVisible}
            title="查找与替换"
            width={370}
            footer={null}
            draggable
            defaultPosition={searchDialogPos}
            mask={false}
            onCancel={handleSearchDialogCancel}
            onValuesChange={handleSearchOrReplaceValuesChange}
            onFinish={handleSearchOrReplaceFinish}
          >
            <Row>
              <Col flex="35px" style={pb24}>
                <Button
                  title="切换模式"
                  icon={searchTypeIcon}
                  className={searchTypeButton}
                  onClick={handleSearchTypeChange}
                />
              </Col>
              <Col flex="auto">
                <Form.Item name="search" rules={noMsgRequired}>
                  <Input placeholder="查找" autoFocus autoComplete="off" />
                </Form.Item>
                {searchResult.length > 0 && (
                  <span className={searchIndicator}>
                    {`${activeSearchIndex !== null ? activeSearchIndex + 1 : '?'}/${searchResult.length}`}
                  </span>
                )}
                {searchType === 'replace' && (
                  <Form.Item name="replace" rules={noMsgRequired}>
                    <Input placeholder="替换" autoComplete="off" />
                  </Form.Item>
                )}
              </Col>
            </Row>
            <Form.Item style={alignRight}>
              <Space>
                <Button onClick={handleSearchResultPrev}>上一个</Button>
                <Button onClick={handleSearchResultNext}>下一个</Button>
                {searchType === 'replace' && (
                  <>
                    <Button htmlType="submit" type="primary" ghost onClick={handleReplaceCurr}>
                      替换
                    </Button>
                    <Button htmlType="submit" type="primary" ghost onClick={handleReplaceAll}>
                      全部替换
                    </Button>
                  </>
                )}
              </Space>
            </Form.Item>
          </FormDialog>
        ),
        onClick(editor) {
          const target = editor.getEditableDOM();
          const pos = target.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(target);
          const { paddingTop, paddingRight } = computedStyle;
          const pt = Number(paddingTop.replace('px', ''));
          const pr = Number(paddingRight.replace('px', ''));
          if (pos) setSearchDialogPos({ x: pos.x + pos.width - 370 - pr, y: pos.y + pt });
          setSearchDialogVisible(true);
        },
      },
      {
        key: 'link',
        type: 'button',
        icon: (editor) => (editor.isElementActive('link') ? <DisconnectOutlined /> : <LinkOutlined />),
        title: (editor) => (editor.isElementActive('link') ? '取消超链接' : '插入超链接'),
        active: (editor) => editor.isElementActive('link'),
        attachRender: (
          <FormDialog
            form={formLink}
            width={355}
            draggable
            title="超链接"
            mask={false}
            open={linkDialogVisible}
            defaultPosition={linkDialogPos}
            onCancel={closeLinkDialog}
            onOk={submitLink}
            onFinish={handleLinkFinish}
          >
            <Form.Item name="url">
              <Input placeholder="请输入地址，例如：http://www.baidu.com" allowClear />
            </Form.Item>
          </FormDialog>
        ),
        onClick(editor, e) {
          const { selection } = editor;
          if (!selection) {
            message.warning('请先选定编辑区！');
            return;
          }

          const open = () => {
            const pos = editor.getBoundingClientRect();
            if (pos) setLinkDialogPos({ x: pos.x + pos.width, y: pos.y + pos.height });
            setLinkDialogVisible(true);
            return;
          };

          // 处理特殊请求，一般从Content：即文本编辑区中发出
          if (e?.target === 'emitter_edit') {
            // 编辑请求：更新赋值
            const url = editor.getElementFieldsValue('url', 'link');
            formLink.setFieldsValue({ url });
            open();
            return;
          }

          const isActive = editor.isElementActive('link');
          if (isActive) {
            // 已有超链接状态
            editor.unsetLink();
            ReactEditor.focus(editor);
            return;
          }

          open();
        },
      },
      {
        key: 'image',
        type: 'button',
        icon: <Icon component={SvgrImage} />,
        title: '图片',
        disabled: (editor) => editor.isElementActive('image'),
        attachRender: (
          <FormDialog
            form={formImage}
            width={355}
            confirmLoading={imgDialogLoading}
            draggable
            layout="horizontal"
            labelCol={span4}
            title="图片"
            mask={false}
            defaultPosition={imageDialogPos}
            open={imageDialogVisible}
            onCancel={_closeImageDialog}
            onOk={submitImage}
            onFinish={handleImageFinish}
            onValuesChange={handleImageDialogValuesChange}
          >
            <Form.Item name="source" initialValue={defaultImgSource} style={alignCenter}>
              <Radio.Group optionType="button" options={imgSourceOptions} />
            </Form.Item>
            {imgSource === 'local' && (
              <Form.Item label="上传" name="file" rules={required}>
                <FileUpload placeholder="请选择文件上传" accept=".jpg, .jpeg, .png, .gif, .svg" />
              </Form.Item>
            )}
            {imgSource === 'remote' && (
              <Form.Item label="地址" name="url" rules={required}>
                <Input placeholder="请输入图片地址" allowClear />
              </Form.Item>
            )}
            <Form.Item label="元素" name="inline" rules={required} initialValue={true}>
              <Radio.Group optionType="button" options={imgElementOptions} />
            </Form.Item>
            <Form.Item label="宽度" name="width">
              <InputNumber step="0.1" precision={2} min={1} placeholder="auto (px)" style={w88} />
            </Form.Item>
            <Form.Item label="高度" name="height">
              <InputNumber step="0.1" precision={2} min={1} placeholder="auto (px)" style={w88} />
            </Form.Item>
          </FormDialog>
        ),
        onClick(editor, e) {
          const { selection } = editor;
          if (!selection) {
            message.warning('请先选定编辑区！');
            return;
          }

          const open = () => {
            const pos = editor.getBoundingClientRect();
            if (pos) setImageDialogPos({ x: pos.x + pos.width, y: pos.y + pos.height });
            setImageDialogVisible(true);
            return;
          };

          if (e?.target === 'emitter_edit') {
            // 编辑请求
            const ele = editor.getElementFieldsValue(true, 'image') as ImageElement;
            formImage.setFieldsValue({ ...ele, inline: !!ele.inline });
            setImgSource(ele.source || defaultImgSource);
            setImageDialogMode('update');
            open();
            return;
          }

          open();
        },
      },
      {
        key: 'formula',
        type: 'button',
        title: '公式',
        icon: <FunctionOutlined />,
        attachRender: (
          <FormDialog
            form={formFormula}
            width={400}
            draggable
            title="公式"
            mask={false}
            footer={null}
            open={formulaDialogVisible}
            defaultPosition={formulaDialogPos}
            onCancel={closeFormulaDialog}
          >
            <Form.Item name="tex">
              <Input.TextArea rows={4} placeholder="请输入 LaTeX 公式，例如：a^2+b^2=c^2" />
            </Form.Item>
            <Form.Item style={alignRight}>
              <div className={between}>
                <Button size="small" type="link" className={linkButton} onClick={handleTexHelpDocument}>
                  还不了解LaTeX公式，查看帮助
                </Button>
                <Button htmlType="submit" type="primary">
                  确定
                </Button>
              </div>
            </Form.Item>
          </FormDialog>
        ),
        onClick(editor, e) {
          const { selection } = editor;
          if (!selection) {
            message.warning('请先选定编辑区！');
            return;
          }

          const open = () => {
            const pos = editor.getBoundingClientRect();
            if (pos) setFormulaDialogPos({ x: pos.x + pos.width, y: pos.y + pos.height });
            setFormulaDialogVisible(true);
            return;
          };

          if (e?.target === 'emitter_edit') {
            // 编辑
            open();
            return;
          }

          open();
        },
      },
    ],
    [
      getFontColorElement,
      getHighlightElement,
      formSearch,
      searchDialogVisible,
      searchDialogPos,
      handleSearchDialogCancel,
      handleSearchOrReplaceValuesChange,
      handleSearchOrReplaceFinish,
      searchTypeIcon,
      searchTypeButton,
      handleSearchTypeChange,
      searchResult.length,
      searchIndicator,
      activeSearchIndex,
      searchType,
      handleSearchResultPrev,
      handleSearchResultNext,
      handleReplaceCurr,
      handleReplaceAll,
      formLink,
      linkDialogVisible,
      linkDialogPos,
      closeLinkDialog,
      submitLink,
      handleLinkFinish,
      formImage,
      imgDialogLoading,
      imageDialogPos,
      imageDialogVisible,
      _closeImageDialog,
      submitImage,
      handleImageFinish,
      handleImageDialogValuesChange,
      imgSource,
      formFormula,
      formulaDialogVisible,
      formulaDialogPos,
      closeFormulaDialog,
      between,
      linkButton,
      handleTexHelpDocument,
      mp0,
      bold,
      setSearchDialogPos,
      setSearchDialogVisible,
      setLinkDialogPos,
      setLinkDialogVisible,
      setImageDialogPos,
      setImageDialogVisible,
      setImageDialogMode,
      setFormulaDialogPos,
      setFormulaDialogVisible,
    ]
  );

  return baseResolver;
}
