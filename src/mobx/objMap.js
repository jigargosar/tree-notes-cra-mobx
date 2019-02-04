import { action, extendObservable, isObservable, observable } from 'mobx'

function createObjMap(initial = {}, options) {
  if (!isObservable(initial)) {
    initial = observable.object(initial, null, options)
  }

  return extendObservable(
    initial,
    {
      get: k => initial[k],
      set: (k, v) => (initial[k] = v),
    },
    { get: action, set: action },
  )
}
