import { action, get, remove, set } from 'mobx'
import validate from 'aproba'
import * as R from 'ramda'
import { clampIdx } from '../ramda-helpers'

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

export function wrapActions(obj) {
  validate('O', arguments)

  return R.mapObjIndexed((fn, name) => action(name, fn))(obj)
}

export function moveItemByClampedOffset(item, offset, a) {
  validate('*NA', arguments)

  const from = a.indexOf(item)
  const to = clampIdx(from + offset, a)

  if (from < 0 || from === to) return
  a.splice(from, 1)
  a.splice(to, 0, item)
}

export function removeByIndexOf(item, a) {
  remove(a, a.indexOf(item))
}
