import React, { memo, useCallback } from 'react';
import { Button as AntdButton, Tooltip } from 'antd';

import type { ButtonProps as AntdButtonProps } from 'antd';

export interface ButtonProps<DatasetType = any> extends Omit<AntdButtonProps, 'onClick' | 'title'> {
  active?: boolean;
  title?: React.ReactNode;
  dataset?: any;
  onClick?: (e: React.MouseEvent<HTMLElement>, dataset?: DatasetType) => void;
}

function Button<DatasetType = any>(props: ButtonProps<DatasetType>) {
  const { active, children, title, dataset, onClick, ...restProps } = props;

  const handleClick = useCallback<React.MouseEventHandler<HTMLElement>>(
    (e) => {
      onClick?.(e, dataset);
    },
    [dataset, onClick]
  );

  return (
    <Tooltip title={title} showArrow={false}>
      <AntdButton {...restProps} type={active ? 'primary' : 'text'} onClick={handleClick}>
        {children}
      </AntdButton>
    </Tooltip>
  );
}

export default memo(Button) as typeof Button; // 泛型组件断言继承泛型
