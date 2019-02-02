import { Overmind } from 'overmind'
import { namespaced } from 'overmind/config'
import { createHook } from 'overmind-react'
import { notes } from './notes'

const overmind = new Overmind(namespaced({ notes }), {
  name: 'Overmind Notes',
})

window.ov = overmind

export const useOvermindNotes = createHook(overmind)
