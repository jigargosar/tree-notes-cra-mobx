import * as R from 'ramda'
import validate from 'aproba'

export const defaultEmptyTo = def =>
  R.pipe(
    R.defaultTo(''),
    R.when(R.isEmpty, R.always(def)),
  )

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

export const clampIdx = R.curry(function clampIdx(idx, a) {
  validate('NA', arguments)

  return R.clamp(0, a.length - 1)(idx)
})
