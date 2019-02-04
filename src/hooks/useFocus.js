import React from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'

export function useFocusRef(ref, shouldFocus, deps = null) {
  React.useLayoutEffect(() => {
    const el = ref.current
    if (el && shouldFocus) {
      scrollIntoView(el, {
        behavior: 'smooth',
        scrollMode: 'if-needed',
        block: 'center',
        inline: 'center',
      })
      el.focus()
    }
  }, deps)
}
