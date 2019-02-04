import {
  action,
  extendObservable,
  isObservable,
  keys,
  observable,
  values,
} from 'mobx'

export function createObjMap(obj = {}, options) {
  if (!isObservable(obj)) {
    obj = observable.object(obj, null, options)
  }

  return extendObservable(
    obj,
    {
      get: k => obj[k],
      set: (k, v) => (obj[k] = v),
      get keys() {
        return keys(obj)
      },
      get values() {
        return values(obj)
      },
    },
    { get: action, set: action },
  )
}
