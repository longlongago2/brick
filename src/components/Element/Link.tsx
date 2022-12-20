import React, { memo } from 'react';
import { useSelected, useFocused } from 'slate-react';
import classNames from 'classnames';
import InlineChromiumBugfix from '../InlineChromiumBugfix';
import useStyled from './styled';

import type { RenderElementProps } from 'slate-react';
import type { LinkElement } from 'slate';

function Link(props: RenderElementProps) {
  const { attributes, children, element } = props;

  const selected = useSelected();

  const focused = useFocused();

  const { link } = useStyled();

  const linkEle = element as LinkElement;

  return (
    <a
      {...attributes}
      href={linkEle.url}
      className={classNames(link, {
        'link--selected': selected,
        'link--selected-blur': selected && !focused,
      })}
    >
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </a>
  );
}

export default memo(Link);
