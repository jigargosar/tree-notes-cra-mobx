import { isObservable, observable } from 'mobx'

function createObjMap(initial = {}) {
  if (!isObservable(initial)) {
    initial = observable.object(initial)
  }
}
