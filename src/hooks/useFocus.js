import React from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'

export function useFocusRef(ref, shouldFocus, deps = null) {
  React.useLayoutEffect(() => {
    console.log(`shouldFocus`, shouldFocus)
    const el = ref.current
    if (el && shouldFocus) {
      // if (el !== document.activeElement) {
      //   el.focus()
      // } else {
      //   el.scrollIntoView({
      //     behavior: 'auto',
      //     block: 'center',
      //     inline: 'nearest',
      //   })
      // }

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
