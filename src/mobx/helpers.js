import { action, get, set } from 'mobx'
import validate from 'aproba'
import * as R from 'ramda'
import { clampIdx } from '../utils'

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
  const to = clampIdx(from + offset, a)

  if (from < 0 || from === to) return
  a.splice(from, 1)
  a.splice(to, 0, item)
}

// export function moveElementInArray (array, value, positionChange) {
//   const oldIndex = array.indexOf(value)
//   if (oldIndex > -1){
//     let newIndex = (oldIndex + positionChange)
//     if (newIndex < 0){
//       newIndex = 0
//     }else if (newIndex >= array.length){
//       newIndex = array.length
//     }
//     const arrayClone = array.slice()
//     arrayClone.splice(oldIndex,1)
//     arrayClone.splice(newIndex,0,value)
//     return arrayClone
//   }
//   return array
// }
