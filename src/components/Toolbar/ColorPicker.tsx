import React, { memo, useCallback, useState, useMemo, useEffect } from 'react';
import { Popover, Button, Tooltip } from 'antd';
import { CaretDownFilled } from '@ant-design/icons';
import { SketchPicker } from 'react-color';
import useStyled from './styled';

import type { SketchPickerProps, ColorChangeHandler, Color, RGBColor, HSLColor } from 'react-color';

const align = { offset: [0, 4] };

const p0 = { padding: 0 };

const pickerStyles: SketchPickerProps['styles'] = {
  default: {
    picker: {
      backgroundColor: 'transparent',
      border: 0,
      boxShadow: 'none',
    },
    color: {
      borderRadius: 3,
      overflow: 'hidden',
    },
    activeColor: {
      boxShadow: 'none',
    },
    hue: {
      borderRadius: 2,
    },
    alpha: {
      borderRadius: 2,
    },
  },
};

/**
 * 颜色反序列化：将字符串颜色转换成Color对象颜色
 * @param color 颜色：hex,rgb,hsl
 * @returns Color
 */
export const colorParse = (color: string): Color => {
  if (color.indexOf('rgb') > -1) {
    // rgba
    const cs = color
      .replace(/^(rgb|rgba)\(/, '')
      .replace(/\)$/, '')
      .replace(/\s/g, '')
      .split(',');
    const rgb: RGBColor = {
      r: Number(cs[0]),
      g: Number(cs[1]),
      b: Number(cs[2]),
      a: cs[3] ? Number(cs[3]) : undefined,
    };
    return rgb;
  }
  if (color.indexOf('hsl') > -1) {
    // hsla
    const cs = color
      .replace(/^(hsl|hsla)\(/, '')
      .replace(/\)$/, '')
      .replace(/\s/g, '')
      .split(',');
    const hsl: HSLColor = {
      h: Number(cs[0]),
      s: Number(cs[1].replace('%', '')) / 100,
      l: Number(cs[2].replace('%', '')) / 100,
      a: cs[3] ? Number(cs[3]) : undefined,
    };
    return hsl;
  }
  // hex
  return color;
};

/**
 * 颜色序列化：将Color类型的颜色转换成字符串
 * @param color
 * @returns color string
 */
export const colorStringify = (color: Color) => {
  if (typeof color === 'object' && 'r' in color) {
    // rgba
    if (color.a) {
      return `rgba(${color.r},${color.g},${color.b},${color.a})`;
    }
    return `rgb(${color.r},${color.g},${color.b})`;
  }
  if (typeof color === 'object' && 'h' in color) {
    // hsla
    if (color.a) {
      return `hsla(${color.h},${color.s * 100}%,${color.l * 100}%,${color.a})`;
    }
    return `hsl(${color.h},${color.s * 100}%,${color.l * 100}%)`;
  }
  // hex
  return color;
};

export interface ColorPickerProps {
  value?: Color;
  defaultValue?: Color;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  onChange?: (value: Color) => void;
  onClick?: (value: Color) => void;
}

function ColorPicker(props: ColorPickerProps) {
  const { value, defaultValue, icon, title, onChange, onClick } = props;

  // memorize
  const [color, setColor] = useState<Color | undefined>(defaultValue || value);

  useEffect(() => {
    if (value) {
      // sync value to color
      setColor(value);
    }
  }, [value]);

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [tooltipVisible, setTooltipVisible] = useState(false);

  const { colorPicker, dropdownIcon, dropdownButton, sketchPicker } = useStyled();

  // handler
  const handleDropdownOpenChange = useCallback((visible: boolean) => {
    setDropdownVisible(visible);
    if (visible) {
      setTooltipVisible(false);
    }
  }, []);

  const handleTooltipOpenChange = useCallback((visible: boolean) => {
    setTooltipVisible(visible);
  }, []);

  const handleColorChange = useCallback<ColorChangeHandler>((color) => {
    // 经常发生的拖动事件上调用的。如果您只需要一次获得颜色，请使用onChangeComplete.
    // 但是只使用onChangeComplete只执行最后的一次，手柄的拖动因而变得生硬
    // 所以此处结合两个事件，保证内部顺畅拖动，和避免外部频繁触发onChange
    setColor(color.rgb);
  }, []);

  const handleClick = useCallback(() => {
    if (color) onClick?.(color);
  }, [color, onClick]);

  const handleColorChangeComplete = useCallback<ColorChangeHandler>(
    (_color) => {
      onChange?.(_color.rgb);
    },
    [onChange]
  );

  // memorize
  const content = useMemo(
    () => (
      <SketchPicker
        className={sketchPicker}
        color={color}
        styles={pickerStyles}
        onChange={handleColorChange}
        onChangeComplete={handleColorChangeComplete}
      />
    ),
    [color, handleColorChange, handleColorChangeComplete, sketchPicker]
  );

  const resolveColor = useCallback((_color: Color): React.CSSProperties => {
    const color = colorStringify(_color);
    return { backgroundColor: color };
  }, []);

  const colorBlock = useMemo<React.CSSProperties | undefined>(
    () => (color ? resolveColor(color) : undefined),
    [color, resolveColor]
  );

  return (
    <Button.Group size="small">
      <Tooltip title={title} showArrow={false}>
        <Button type="text" className={dropdownButton} onClick={handleClick}>
          <div className={colorPicker}>
            <span className="color-picker--inner">{icon}</span>
            <span className="color-picker--color" style={colorBlock} />
          </div>
        </Button>
      </Tooltip>
      <Popover
        content={content}
        trigger="click"
        open={dropdownVisible}
        onOpenChange={handleDropdownOpenChange}
        showArrow={false}
        align={align}
        overlayInnerStyle={p0}
      >
        <Tooltip
          title="选择颜色"
          showArrow={false}
          open={tooltipVisible}
          onOpenChange={handleTooltipOpenChange}
        >
          <Button type="text" className={dropdownButton}>
            <CaretDownFilled className={dropdownIcon} />
          </Button>
        </Tooltip>
      </Popover>
    </Button.Group>
  );
}

export default memo(ColorPicker);
