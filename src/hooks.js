import * as R from 'ramda'
import validate from 'aproba'
import { useSetState } from 'react-use'
import { toIdLookup } from './utils'
import { useEffect, useRef, useState } from 'react'
import isHotKey from 'is-hotkey'

export function useLookup(initialList) {
  validate('A', arguments)

  const [state, setState] = useSetState(() => toIdLookup(initialList))

  const set = (k, v) => setState(R.mergeLeft({ [k]: v }))
  const get = k => state[k]
  const has = k => R.isNil(get(k))
  const keys = () => Object.keys(state)
  const values = () => Object.values(state)

  return Object.freeze({ setState, state, set, get, has, keys, values })
}

export function useObject(initial = {}) {
  validate('F|O', arguments)

  const [state, setState] = useState(initial)

  const get = k => state[k]
  const set = (k, v) => setState(R.mergeLeft({ [k]: v }))
  const over = (k, fn) => setState(R.over(R.lensProp(k), fn))
  const values = () => R.values(state)

  return { state, setState, get, set, over, values }
}

export function useString(initial = '') {
  validate('F|S|Z', arguments)

  const [state, setState] = useState(initial)

  const get = () => state
  const set = v => setState(v)

  return { state, setState, get, set }
}

export function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef(null)

  // Store current value in ref
  useEffect(() => {
    ref.current = value
  }, [value]) // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current
}

export function useArrowKeys(ref) {
  function onKeyDown(ev) {
    if (ev.defaultPrevented) {
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