import React, { memo } from 'react';
import { useSelected, useFocused } from 'slate-react';
import InlineChromiumBugfix from '../InlineChromiumBugfix';

import type { RenderElementProps } from 'slate-react';
import type { LinkElement } from 'slate';

function Link(props: RenderElementProps) {
  const { attributes, children, element } = props;

  const selected = useSelected();
  const focused = useFocused();

  const linkEle = element as LinkElement;

  return (
    <a {...attributes} href={linkEle.url}>
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </a>
  );
}

export default memo(Link);
