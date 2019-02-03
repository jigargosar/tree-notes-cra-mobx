import * as R from 'ramda'
import validate from 'aproba'
import { useSetState } from 'react-use'
import { isFunction } from './utils'

export function useLookup(initialList = [], options = {}) {
  validate('FO|F|AO|A', arguments)

  function getId(item) {
    validate('O', [item])
    const id = (R.prop('getId')(options) || R.prop('id'))(item)
    validate('S', [id])
    return id
  }

  const [state, setState] = useSetState(() => {
    if (isFunction(initialList)) {
      initialList = initialList()
    }
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
