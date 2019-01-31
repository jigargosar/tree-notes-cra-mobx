import * as R from 'ramda'

export const defaultEmptyTo = def =>
  R.pipe(
    R.defaultTo(''),
    R.when(R.isEmpty, R.always(def)),
  )

export function getCachedOr(def, key) {
  return R.defaultTo(def, JSON.parse(localStorage.getItem(key)))
}

export function cache(key, jsonValue) {
  localStorage.setItem(key, JSON.stringify(jsonValue))
}
