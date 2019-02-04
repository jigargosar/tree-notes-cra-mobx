import validate from 'aproba'
import { extendObservable, observable } from 'mobx'

export function createToggle(initial = false, options) {
  validate('B', arguments)
  const b = observable.box(
    initial,
    Object.assign({}, { name: 'Toggle' }, options),
  )
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
