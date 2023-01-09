import React, { memo, useCallback, useRef, useState } from 'react';
import { Input } from 'antd';
import type { InputProps } from 'antd';
import classNames from 'classnames';
import useStyled from './styled';

export interface FileUploadProps {
  value?: File;
  style?: InputProps['style'];
  placeholder?: InputProps['placeholder'];
  size?: InputProps['size'];
  className?: InputProps['className'];
  accept?: string;
  onChange?: (value: File) => void;
}

function FileUpload(props: FileUploadProps) {
  const { value, style, placeholder, size, className, accept, onChange } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState(value ? value.name : '');

  const { hidden, core } = useStyled();

  const handleClick = useCallback(() => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    inputRef.current?.dispatchEvent(event);
  }, []);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange?.(file);
    }
  };

  return (
    <>
      <Input
        className={classNames(core, className)}
        value={fileName}
        readOnly
        style={style}
        placeholder={placeholder}
        size={size}
        onClick={handleClick}
      />
      <input
        ref={inputRef}
        className={hidden}
        type="file"
        hidden
        onChange={handleFileChange}
        accept={accept}
      />
    </>
  );
}

export default memo(FileUpload);
