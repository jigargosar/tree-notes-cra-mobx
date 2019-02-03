import * as R from 'ramda'
import validate from 'aproba'
import { useSetState } from 'react-use'
import { isFunction } from './utils'
import { useEffect, useRef } from 'react'

export function useLookup(initialList = []) {
  if (isFunction(initialList)) {
    initialList = initialList()
  }

  validate('A', [initialList])

  function getId(item) {
    return R.tap(id => validate('S', [id]))(item.id)
  }
  const [state, setState] = useSetState(() => {
    return initialList.reduce((acc, item) => {
      acc[getId(item)] = item
      return acc
    }, {})
  })

  const set = (k, v) => setState(R.mergeLeft({ [k]: v }))
  const get = k => state[k]
  const has = k => R.isNil(get(k))
  const keys = () => Object.keys(state)
  const values = () => Object.values(state)

  return Object.freeze({ setState, state, set, get, has, keys, values })
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
