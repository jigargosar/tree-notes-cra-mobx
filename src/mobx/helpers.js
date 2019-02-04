import { action, get, set } from 'mobx'
import validate from 'aproba'
import * as R from 'ramda'

export function toggle(target, prop) {
  set(target, prop, !get(target, prop))
}

export function insertAtOffsetOf(item, offset, newItem, target) {
  validate('*N*A', arguments)
  const idx = R.indexOf(item)(target)
  if (idx > -1) {
    target.splice(idx + offset, 0, newItem)
  }
}

export function asActions(actionNames) {
  return actionNames.reduce((acc, name) => {
    acc[name] = action
    return acc
  }, {})
}
