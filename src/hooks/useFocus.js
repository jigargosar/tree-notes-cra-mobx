import React from 'react'

export function useFocusRef(ref, shouldFocus, deps = null) {
  React.useLayoutEffect(() => {
    const el = ref.current
    if (el && shouldFocus) {
      el.focus()
    }
  }, deps)
}
