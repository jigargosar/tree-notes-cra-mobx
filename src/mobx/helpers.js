import { get, set } from 'mobx'

function toggle(target, prop) {
  set(target, prop, !get(target, prop))
}
