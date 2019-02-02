import { Overmind } from 'overmind'
import { namespaced } from 'overmind/config'
import { createHook } from 'overmind-react'
import { notes } from './notes'

const overmind = new Overmind(namespaced({ notes }), {
  name: 'Overmind Notes',
})

window._on = overmind

export const useOvermind = createHook(overmind)
