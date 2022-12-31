import React, { memo, useMemo, useState, useCallback } from 'react';
import { Tooltip, Select } from 'antd';
import { isPowerArray } from '../../utils';
import useStyled from './styled';

import type { SelectProps as AntdSelectProps } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { CaretDownFilled } from '@ant-design/icons';

const { Option } = Select;

export interface DropdownOption {
  key: string;
  label: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  disabled?: boolean;
  renderLabel?: (label: string) => React.ReactNode;
}

const suffix = <CaretDownFilled style={{ pointerEvents: 'none' }} />;

export interface SelectProps<DatasetType = any>
  extends Omit<AntdSelectProps, 'onChange' | 'children' | 'ref' | 'optionLabelProp'> {
  title?: React.ReactNode;
  width?: number;
  options?: DropdownOption[];
  dataset?: DatasetType;
  optionDisplayField?: keyof DropdownOption;
  onChange?: (value: any, option: DefaultOptionType | DefaultOptionType[], dataset?: DatasetType) => void; // 继承失败，因为参数不同，所以去掉父类onChange属性
}

function Selector<DatasetType = any>(props: SelectProps<DatasetType>) {
  const { options, title, width = 120, style, dataset, optionDisplayField, onChange, ...restProps } = props;

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

  const handleChange = useCallback<Exclude<AntdSelectProps['onChange'], undefined>>(
    (value, option) => {
      onChange?.(value, option, dataset);
    },
    [dataset, onChange]
  );

  return (
    <Tooltip title={title} open={tooltipVisible} onOpenChange={handleTooltipVisibleChange} showArrow={false}>
      <Select
        style={_style}
        listHeight={300}
        className={selector}
        open={dropdownVisible}
        virtual={false}
        bordered={false}
        allowClear={false}
        dropdownMatchSelectWidth={false}
        onDropdownVisibleChange={handleDropdownVisibleChange}
        suffixIcon={suffix}
        {...restProps}
        optionLabelProp="label"
        onChange={handleChange}
      >
        {isPowerArray(options) &&
          options.map((item) => (
            <Option
              key={item.key}
              className={option}
              value={item.key}
              label={item[optionDisplayField || 'label']}
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

export default memo(Selector) as typeof Selector; // 泛型memo组件继承原始组件的属性的泛型
