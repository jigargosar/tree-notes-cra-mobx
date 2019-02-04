import { createObjMap } from './objMap'
import { action, extendObservable } from 'mobx'

export function createIdLookup(initialItems, options) {
  const om = createObjMap(
    initialItems.reduce((acc, item) => {
      acc[item.id] = item
      return acc
    }, {}),
    Object.assign({}, { name: 'IdLookup' }, options),
  )

  return extendObservable(
    om,
    {
      put: item => om.set(item.id, item),
    },
    { put: action },
  )
}
