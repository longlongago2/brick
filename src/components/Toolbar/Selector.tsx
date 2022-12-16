import React, { memo, useMemo, useCallback, useState } from 'react';
import Tooltip from '@mui/joy/Tooltip';
import Select, { SelectProps, SelectStaticProps, SelectOwnProps } from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import DropdownItem from './DropdownItem';
import { isPowerArray } from '../../utils';

type EventOnChange =
  | React.MouseEvent<Element, MouseEvent>
  | React.KeyboardEvent<Element>
  | React.FocusEvent<Element, Element>
  | null;

export type DropdownOption = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  title?: string | React.ReactElement;
  extra?: React.ReactNode;
};

type SelectValue = DropdownOption['key'];

type EventOnChangeHandler = Exclude<SelectOwnProps<SelectValue>['onChange'], undefined>;

export type BaseSelector<T> = {
  options?: DropdownOption[];
  title?: React.ReactNode;
  dataset?: T;
  width?: number;
  onChange?: (e: EventOnChange, v: SelectValue | null, dataset: T) => void;
};

function Selector(props: BaseSelector<any> & Omit<SelectProps<SelectValue>, 'title' | 'onChange'>) {
  const { options, title, width = 120, dataset, onChange, ...restProps } = props;

  const [visible, setVisible] = useState(false);

  const sx = useMemo(() => ({ width }), [width]);

  const componentsProps = useMemo<SelectStaticProps['componentsProps']>(
    () => ({
      listbox: {
        sx: {
          maxHeight: 300,
          overflow: 'auto',
          minWidth: 'fit-content',
          zIndex: 1501,
        },
      },
      button: {
        sx: {
          display: 'inline-block',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        },
      },
    }),
    []
  );

  const handleChange = useCallback<EventOnChangeHandler>(
    (e, v) => {
      setVisible(false);
      if (onChange) onChange(e, v, dataset);
    },
    [dataset, onChange]
  );

  const handleTooltipOpen = useCallback(() => {
    setVisible(true);
  }, []);

  const handleTooltipClose = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <Tooltip title={title} size="sm" open={visible} onOpen={handleTooltipOpen} onClose={handleTooltipClose}>
      <span role="combobox">
        <Select
          variant="plain"
          size="sm"
          sx={sx}
          componentsProps={componentsProps}
          {...restProps}
          onChange={handleChange}
        >
          {isPowerArray(options) &&
            options.map((item) => (
              <Option key={item.key} value={item.key} label={item.label}>
                <DropdownItem extra={item.extra} icon={item.icon}>
                  {item.title || item.label}
                </DropdownItem>
              </Option>
            ))}
        </Select>
      </span>
    </Tooltip>
  );
}

export default memo(Selector);
