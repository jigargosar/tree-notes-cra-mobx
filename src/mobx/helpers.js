import { get, set } from 'mobx'

export function toggle(target, prop) {
  set(target, prop, !get(target, prop))
}
