import React, { memo, useCallback } from 'react';
import IconButton, { IconButtonProps } from '@mui/joy/IconButton';
import Tooltip from '@mui/joy/Tooltip';

const mr5 = {margin: '5px'};

export interface ButtonProps<T> {
  active?: boolean;
  title?: React.ReactNode;
  dataset?: T;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>, dataset: T) => void;
}

function Button(props: ButtonProps<any> & Omit<IconButtonProps, 'title' | 'onClick'>) {
  const { active, children, title, dataset, onClick, ...restProps } = props;

  const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      if (onClick) onClick(e, dataset);
    },
    [dataset, onClick]
  );

  return (
    <Tooltip title={title} size="sm">
      <IconButton
        {...restProps}
        variant={active ? 'solid' : 'plain'}
        size="sm"
        sx={mr5}
        color="neutral"
        onClick={handleClick}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

export default memo(Button);
