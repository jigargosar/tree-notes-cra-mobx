import * as R from 'ramda'
import validate from 'aproba'
import { useSetState } from 'react-use'
import { toIdLookup } from './utils'
import { useEffect, useRef, useState } from 'react'

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

  return { state, setState, get, set, over }
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
