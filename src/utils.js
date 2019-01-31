import * as R from 'ramda'

export const defaultEmptyTo = def =>
  R.pipe(
    R.defaultTo(''),
    R.when(R.isEmpty, R.always(def)),
  )
