import validate from 'aproba'

export function focusRef(ref) {
  validate('O', arguments)

  if (ref.current) {
    ref.current.focus()
  }
}
