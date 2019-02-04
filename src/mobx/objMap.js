import { extendObservable, isObservable, observable } from 'mobx'

function createObjMap(initial = {}, options) {
  if (!isObservable(initial)) {
    initial = observable.object(initial, null, options)
  }

  return extendObservable(initial, {})
}
