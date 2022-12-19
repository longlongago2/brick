import React, { memo, useCallback } from 'react';
import { Button as AntdButton, Tooltip } from 'antd';

import type { ButtonProps as AntdButtonProps } from 'antd';

export interface BaseButtonProps {
  active?: boolean;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  dataset?: any;
  onClick?: (e: React.MouseEvent<HTMLElement>, dataset?: any) => void;
}

export type ButtonProps = BaseButtonProps & Omit<AntdButtonProps, 'title' | 'onClick' | 'type' | 'icon'>;

function Button(props: ButtonProps) {
  const { active, children, title, icon, dataset, onClick, ...restProps } = props;

  const handleClick = useCallback<React.MouseEventHandler<HTMLElement>>(
    (e) => {
      onClick?.(e, dataset);
    },
    [dataset, onClick]
  );

  return (
    <Tooltip title={title}>
      <AntdButton {...restProps} type={active ? 'primary' : 'text'} onClick={handleClick} icon={icon}>
        {children}
      </AntdButton>
    </Tooltip>
  );
}

export default memo(Button);
