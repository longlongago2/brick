import React, { memo, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useEventListener, useMount } from 'ahooks';
import { EyeFilled } from '@ant-design/icons';
import classNames from 'classnames';
import { useNextTick } from '../../hooks';
import useStyled from './styled';

export interface ImageEnhancerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string;
  height?: number | string;
  inline?: boolean;
  zIndex?: number;
  showNative?: boolean; // 显示原始图片
  active?: boolean;
  onSizeChange?: (size: [number, number]) => void;
}

export type Direction = 'tl' | 'tr' | 'bl' | 'br';

export type Size = [string | number | undefined, string | number | undefined];

function ImageEnhancer(props: ImageEnhancerProps) {
  const { width, height, inline, zIndex = 999, showNative, active, onSizeChange, ...restProps } = props;

  // memoize
  const imgRef = useRef<HTMLImageElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);
  const sizeRef = useRef<HTMLSpanElement>(null);
  const moving = useRef<Direction | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);

  const [size, setSize] = useState<Size>([width, height]);

  const [preview, setPreview] = useState(false);

  const { enhancer, resizable, modal } = useStyled();

  const nextTick = useNextTick();

  // handler
  const handleMoveStart = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, direction: Direction) => {
    moving.current = direction;
    startX.current = e.clientX;
    startY.current = e.clientY;
    if (!handleRef.current) return;
    switch (direction) {
      case 'tl':
        handleRef.current.style.bottom = '0';
        handleRef.current.style.right = '0';
        handleRef.current.style.removeProperty('top');
        handleRef.current.style.removeProperty('left');
        break;
      case 'tr':
        handleRef.current.style.bottom = '0';
        handleRef.current.style.left = '0';
        handleRef.current.style.removeProperty('top');
        handleRef.current.style.removeProperty('right');
        break;
      case 'bl':
        handleRef.current.style.top = '0';
        handleRef.current.style.right = '0';
        handleRef.current.style.removeProperty('bottom');
        handleRef.current.style.removeProperty('left');
        break;
      case 'br':
        handleRef.current.setAttribute('style', 'top: 0; left: 0');
        handleRef.current.style.top = '0';
        handleRef.current.style.left = '0';
        handleRef.current.style.removeProperty('bottom');
        handleRef.current.style.removeProperty('right');
        break;
      default:
        handleRef.current.style.removeProperty('top');
        handleRef.current.style.removeProperty('bottom');
        handleRef.current.style.removeProperty('left');
        handleRef.current.style.removeProperty('right');
        break;
    }
  };

  const handleMoveStop = () => {
    moving.current = null;
    if (!handleRef.current) return;
    const w = Number(handleRef.current.style.width.replace('px', '') || width);
    const h = Number(handleRef.current.style.height.replace('px', '') || height);
    setSize([w, h]);
    onSizeChange?.([w, h]);
  };

  const handleMoving = (e: MouseEvent) => {
    if (!moving.current) return;
    if (!handleRef.current) return;
    if (!sizeRef.current) return;
    if (!imgRef.current) return;
    const offsetW = e.clientX - startX.current;
    const offsetH = e.clientY - startY.current;
    const rect = imgRef.current.getBoundingClientRect(); // 原始图片数据
    let w = Number(size[0] ?? rect.width);
    let h = Number(size[1] ?? rect.height);
    if (moving.current === 'br') {
      w = w + offsetW > 0 ? w + offsetW : 0;
      h = h + offsetH > 0 ? h + offsetH : 0;
    }
    if (moving.current === 'bl') {
      w = w - offsetW > 0 ? w - offsetW : 0;
      h = h + offsetH > 0 ? h + offsetH : 0;
    }
    if (moving.current === 'tl') {
      w = w - offsetW > 0 ? w - offsetW : 0;
      h = h - offsetH > 0 ? h - offsetH : 0;
    }
    if (moving.current === 'tr') {
      w = w + offsetW;
      h = h - offsetH;
    }
    handleRef.current.style.width = `${w}px`;
    handleRef.current.style.height = `${h}px`;
    sizeRef.current.dataset.size = `${w}x${h}`;
  };

  const handleDragStart: React.DragEventHandler<HTMLSpanElement> = (e) => {
    if (!moving.current) return;
    // 防止在 resize moving 的时候误触 drag
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePreview = () => {
    setPreview((v) => !v);
  };

  // effect
  useEventListener('mousemove', handleMoving);

  useEventListener('mouseup', handleMoveStop);

  useMount(() => {
    // 赋值：size 初始值
    nextTick(() => {
      if (!imgRef.current) return;
      const rect = imgRef.current.getBoundingClientRect();
      setSize((v) => {
        let next = v;
        if (next[0] === undefined || next[0] === null || next[0] === '') {
          next = [rect.width, next[1]];
        }
        if (next[1] === undefined || next[1] === null || next[1] === '') {
          next = [next[0], rect.height];
        }
        return next;
      });
    });
  });

  useEffect(() => {
    if (!active) moving.current = null;
  }, [active]);

  // render
  // data-element：提供拖动复制粘贴，获取信息使用，详情请见 src\utils\transformDOMToJSON.ts
  const core = (
    <img
      ref={imgRef}
      width={size[0]}
      height={size[1]}
      {...restProps}
      data-element={inline ? 'inline' : 'block'}
    />
  );

  if (showNative) {
    return core;
  }

  return (
    <span
      role="img"
      style={{
        width: size[0],
        height: size[1],
      }}
      className={enhancer}
      contentEditable={false}
      onDragStart={handleDragStart}
    >
      {core}
      {active && (
        <span
          ref={handleRef}
          className={resizable}
          style={{
            width: size[0],
            height: size[1],
            top: 0,
            left: 0,
          }}
        >
          <span ref={sizeRef} className={`${resizable}--size`} data-size={`${size[0]}x${size[1]}`} />
          <button className={`${resizable}--preview`} title="预览" onClick={handlePreview}>
            <EyeFilled style={{ fontSize: 20 }} />
          </button>
          <button
            className={classNames(`${resizable}--handle`, `${resizable}--handle-tl`)}
            onMouseDown={(e) => handleMoveStart(e, 'tl')}
          ></button>
          <button
            className={classNames(`${resizable}--handle`, `${resizable}--handle-tr`)}
            onMouseDown={(e) => handleMoveStart(e, 'tr')}
          ></button>
          <button
            className={classNames(`${resizable}--handle`, `${resizable}--handle-bl`)}
            onMouseDown={(e) => handleMoveStart(e, 'bl')}
          ></button>
          <button
            className={classNames(`${resizable}--handle`, `${resizable}--handle-br`)}
            onMouseDown={(e) => handleMoveStart(e, 'br')}
          ></button>
        </span>
      )}
      {preview &&
        ReactDOM.createPortal(
          <div className={modal} style={{ zIndex }} onClick={handlePreview}>
            <img {...restProps} />
          </div>,
          document.body
        )}
    </span>
  );
}

export default memo(ImageEnhancer);
