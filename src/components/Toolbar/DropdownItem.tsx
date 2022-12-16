import React, { memo } from 'react';
import {
  DropdownWrapperStyled,
  DropdownIconStyled,
  DropdownInnerStyled,
  DropdownExtraStyled,
  DropdownMainStyled,
} from './styled';

export type DropdownItemProps = {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  extra?: React.ReactNode;
};

/**
 * @description 标准渲染 option 例如：[icon 标题一 Ctrl+Alt+1]
 * @param {DropdownItemProps} props
 * @return {*}
 */
function DropdownItem(props: DropdownItemProps) {
  const { icon, children, extra } = props;
  return (
    <DropdownWrapperStyled>
      <DropdownMainStyled>
        {icon && <DropdownIconStyled>{icon}</DropdownIconStyled>}
        <DropdownInnerStyled>{children}</DropdownInnerStyled>
      </DropdownMainStyled>
      {extra && <DropdownExtraStyled>{extra}</DropdownExtraStyled>}
    </DropdownWrapperStyled>
  );
}

export default memo(DropdownItem);
