import React, { memo, useRef, useState } from 'react';
import { useSelected, useSlate } from 'slate-react';
import { useEventListener } from 'ahooks';
import { EyeFilled } from '@ant-design/icons';
import classNames from 'classnames';
import useStyled from './styled';

export interface ImageEnhancerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number;
  height?: number;
  onSizeChange?: (size: [number, number]) => void;
}

export type Direction = 'tl' | 'tr' | 'bl' | 'br';

function ImageEnhancer(props: ImageEnhancerProps) {
  const { width = 50, height = 50, onSizeChange, ...restProps } = props;

  const handleRef = useRef<HTMLSpanElement>(null);
  const sizeRef = useRef<HTMLSpanElement>(null);
  const moving = useRef<Direction | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);

  const [size, setSize] = useState([width, height]);

  const [preview, setPreview] = useState(false);

  const { enhancer, resizable } = useStyled();

  const editor = useSlate();

  const selected = useSelected();

  const locked = editor.getElementFieldsValue('lock', 'paragraph');

  const handleStartDrag = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, direction: Direction) => {
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

  const handleStopDrag = () => {
    moving.current = null;
    if (!handleRef.current) return;
    const w = Number(handleRef.current.style.width.replace('px', ''));
    const h = Number(handleRef.current.style.height.replace('px', ''));
    setSize([w, h]);
    onSizeChange?.([w, h]);
  };

  const handleDragging = (e: MouseEvent) => {
    if (!moving.current) return;
    if (!handleRef.current) return;
    if (!sizeRef.current) return;
    const offsetW = e.clientX - startX.current;
    const offsetH = e.clientY - startY.current;
    let w = size[0];
    let h = size[1];
    if (moving.current === 'br') {
      w = size[0] + offsetW > 0 ? size[0] + offsetW : 0;
      h = size[1] + offsetH > 0 ? size[1] + offsetH : 0;
    }
    if (moving.current === 'bl') {
      w = size[0] - offsetW > 0 ? size[0] - offsetW : 0;
      h = size[1] + offsetH > 0 ? size[1] + offsetH : 0;
    }
    if (moving.current === 'tl') {
      w = size[0] - offsetW > 0 ? size[0] - offsetW : 0;
      h = size[1] - offsetH > 0 ? size[1] - offsetH : 0;
    }
    if (moving.current === 'tr') {
      w = size[0] + offsetW;
      h = size[1] - offsetH;
    }
    handleRef.current.style.width = `${w}px`;
    handleRef.current.style.height = `${h}px`;
    sizeRef.current.innerText = `${w}x${h}`;
  };

  const handlePreview = () => {
    setPreview(true);
  };

  useEventListener('mousemove', handleDragging);

  useEventListener('mouseup', handleStopDrag);

  return (
    <span
      role="img"
      style={{
        width: size[0],
        height: size[1],
      }}
      className={enhancer}
      contentEditable={false}
    >
      <img width={size[0]} height={size[1]} {...restProps} />
      {selected && !locked && (
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
          <span ref={sizeRef} className={`${resizable}--size`}>{`${size[0]}x${size[1]}`}</span>
          <button className={`${resizable}--preview`} title="预览" onClick={handlePreview}>
            <EyeFilled style={{ fontSize: 20 }} />
          </button>
          <button
            className={classNames(`${resizable}--handle`, `${resizable}--handle-tl`)}
            onMouseDown={(e) => handleStartDrag(e, 'tl')}
          ></button>
          <button
            className={classNames(`${resizable}--handle`, `${resizable}--handle-tr`)}
            onMouseDown={(e) => handleStartDrag(e, 'tr')}
          ></button>
          <button
            className={classNames(`${resizable}--handle`, `${resizable}--handle-bl`)}
            onMouseDown={(e) => handleStartDrag(e, 'bl')}
          ></button>
          <button
            className={classNames(`${resizable}--handle`, `${resizable}--handle-br`)}
            onMouseDown={(e) => handleStartDrag(e, 'br')}
          ></button>
        </span>
      )}
    </span>
  );
}

export default memo(ImageEnhancer);
