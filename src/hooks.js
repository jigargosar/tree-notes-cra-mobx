import * as R from 'ramda'
import validate from 'aproba'
import { useState } from 'react'

export function useObject(initial = {}) {
  validate('F|O', arguments)

  const [state, setState] = useState(initial)

  const get = k => state[k]
  const set = (k, v) => setState(R.mergeLeft({ [k]: v }))
  const over = (k, fn) => setState(R.over(R.lensProp(k), fn))
  const values = () => R.values(state)

  return { state, setState, get, set, over, values }
}
