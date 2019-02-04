import validate from 'aproba'
import { extendObservable, observable } from 'mobx'

function createToggle(initial = false) {
  validate('B', arguments)
  const b = observable.box(initial)
  return extendObservable(b, {
    get is() {
      return b.get()
    },
    get not() {
      return !b.get()
    },
    toggle: () => b.set(b.not),
  })
}
