import * as R from 'ramda'
import validate from 'aproba'

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

export const isFunction = R.is(Function)

export const tapValidate = rawSchemas =>
  R.tap(id => validate(rawSchemas, [id]))

export function idProp(item) {
  return tapValidate('S')(item.id)
}

export function toIdLookup(initialList) {
  return initialList.reduce((acc, item) => {
    acc[idProp(item)] = item
    return acc
  }, {})
}
