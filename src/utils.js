import * as R from 'ramda'
import validate from 'aproba'

export const defaultEmptyTo = def =>
  R.pipe(
    R.defaultTo(''),
    R.when(R.isEmpty, R.always(def)),
  )

export function getCachedOr_(thunk, key) {
  return R.when(R.isNil)(thunk)(
    JSON.parse(localStorage.getItem(key) || null),
  )
}

export function getCached(key) {
  validate('S', arguments)

  try {
    return JSON.parse(localStorage.getItem(key) || null)
  } catch (e) {
    console.error(e)
    return null
  }
}

export const cache = R.curry(function setCache(key, jsonValue) {
  validate('S*', arguments)
  localStorage.setItem(key, JSON.stringify(jsonValue))
})

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

export function appendChildId(id) {
  return R.over(R.lensProp('childIds'), R.append(id))
}
