import { action, get, set } from 'mobx'
import validate from 'aproba'
import * as R from 'ramda'

export function toggle(target, prop) {
  validate('OS', arguments)

  set(target, prop, !get(target, prop))
}

export function insertAtOffsetOf(item, offset, newItem, a) {
  validate('*N*A', arguments)
  const idx = R.indexOf(item)(a)
  if (idx > -1) {
    a.splice(idx + offset, 0, newItem)
  }
}

export function asActions(actionNames) {
  return actionNames.reduce((acc, name) => {
    acc[name] = action
    return acc
  }, {})
}

export function moveItemTo(item, to, a) {
  validate('*NA', arguments)

  const from = a.indexOf(item)
  if (from < 0 || from === to) return
  a.splice(to < 0 ? a.length + to : to, 0, a.splice(from, 1)[0])
}

export function moveItemByClampedOffset(item, offset, a) {
  validate('*NA', arguments)

  const from = a.indexOf(item)
  const to = R.clamp(0, a.length - 1)(from + offset)

  if (from < 0 || from === to) return
  a.splice(to < 0 ? a.length + to : to, 0, a.splice(from, 1)[0])
}
