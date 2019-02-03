import React from 'react'
import * as R from 'ramda'
import validate from 'aproba'

export function useLookup(initialList = [], options = {}) {
  validate('AO|A|', arguments)

  const { getId = R.prop('id') } = options
  const [state, setState] = React.useState(
    initialList.reduce((acc, item) => {
      acc[getId(item)] = item
      return acc
    }, {}),
  )

  const set = (k, v) => setState(R.mergeLeft({ [k]: v }))
  const get = k => state[k]
  const has = k => R.isNil(get(k))
  const keys = () => Object.keys(state)
  const values = () => Object.values(state)

  return Object.freeze(setState, state, set, get, has, keys, values)
}
