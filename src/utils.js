import * as R from 'ramda'

export const defaultEmptyTo = def =>
  R.pipe(
    R.defaultTo(''),
    R.when(R.isEmpty, R.always(def)),
  )

export function getCachedOr(thunk, key) {
  return R.when(R.isNil)(thunk)(JSON.parse(localStorage.getItem(key)))
}

export function cache(key, jsonValue) {
  localStorage.setItem(key, JSON.stringify(jsonValue))
}

export function removeCached(cacheKey) {
  localStorage.removeItem(cacheKey)
}
