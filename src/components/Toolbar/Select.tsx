import React, { memo, useMemo, useState, useCallback } from 'react';
import { Tooltip, Select } from 'antd';
import { isPowerArray } from '../../utils';
import useStyled from './styled';

import type { SelectProps as AntdSelectProps } from 'antd';

const { Option } = Select;

export interface DropdownOption {
  key: string;
  label: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  renderLabel?: (label: string) => React.ReactNode;
}

export interface BaseSelectProps {
  title?: React.ReactNode;
  width?: number;
  options?: DropdownOption[];
}

export type SelectProps = BaseSelectProps & Omit<AntdSelectProps, 'options'>;

function Selector(props: SelectProps) {
  const { options, title, width = 120, style, ...restProps } = props;

  const [tooltipVisible, setTooltipVisible] = useState(false);

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const { selector, option } = useStyled();

  const _style = useMemo(() => ({ ...style, width }), [style, width]);

  const handleTooltipVisibleChange = useCallback(
    (v: boolean) => {
      if (dropdownVisible === true && v === true) return;
      setTooltipVisible(v);
    },
    [dropdownVisible]
  );

  const handleDropdownVisibleChange = useCallback(
    (v: boolean) => {
      setDropdownVisible(v);
      if (v === true && tooltipVisible === true) {
        setTooltipVisible(false);
      }
    },
    [tooltipVisible]
  );

  return (
    <Tooltip title={title} open={tooltipVisible} onOpenChange={handleTooltipVisibleChange}>
      <Select
        className={selector}
        style={_style}
        bordered={false}
        allowClear={false}
        optionLabelProp="label"
        open={dropdownVisible}
        onDropdownVisibleChange={handleDropdownVisibleChange}
        {...restProps}
      >
        {isPowerArray(options) &&
          options.map((item) => (
            <Option
              key={item.key}
              className={option}
              value={item.key}
              label={item.label}
              title={item.label}
              dataset={item}
            >
              {item.icon && <span className="option--icon">{item.icon}</span>}
              <span className="option--main">{item.renderLabel?.(item.label) || item.label}</span>
              {item.extra && <span className="option--extra">{item.extra}</span>}
            </Option>
          ))}
      </Select>
    </Tooltip>
  );
}

export default memo(Selector);
