import React from 'react'

export function useFocusRef(ref, shouldFocus, deps = null) {
  React.useLayoutEffect(() => {
    console.log(`shouldFocus`, shouldFocus)
    const el = ref.current
    if (el && shouldFocus) {
      el.blur()
      el.focus()
    }
  }, deps)
}
