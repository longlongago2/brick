import React, { memo } from 'react';

// Put this at the start and end of an inline component to work around this Chromium bug:
// https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
function InlineChromiumBugfix() {
  return (
    <span contentEditable={false} style={{ fontSize: 0 }}>
      ${String.fromCodePoint(160) /* Non-breaking space */}
    </span>
  );
}

export default memo(InlineChromiumBugfix);
