import isHotKey from 'is-hotkey'
import * as R from 'ramda'
import { useEffect } from 'react'

export function useArrowKeys(ref) {
  function onKeyDown(ev) {
    if (ev.defaultPrevented || !ref.current) {
      return
    }

    const targetIsFocusable = ev.target.dataset.isFocusable

    if (targetIsFocusable) {
      const focusables = Array.from(
        ref.current.querySelectorAll('[data-is-focusable=true]').values(),
      )

      const idx = focusables.indexOf(ev.target)
      if (isHotKey(['up', 'left'])(ev)) {
        const newIdx = R.mathMod(idx - 1)(focusables.length)
        focusables[newIdx].focus()
        ev.preventDefault()
      } else if (isHotKey(['down', 'right'])(ev)) {
        const newIdx = R.mathMod(idx + 1)(focusables.length)
        focusables[newIdx].focus()
        ev.preventDefault()
      }
    }
  }

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('keydown', onKeyDown)
    }
    return () => {
      if (ref.current) {
        ref.current.removeEventListener('keydown', onKeyDown)
      }
    }
  }, [])
}
