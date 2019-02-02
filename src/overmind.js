import { Overmind } from 'overmind'
import { createHook } from 'overmind-react'

import {
  appendChildId,
  createInitialNotesByIdState,
  createNewNote,
  ROOT_NOTE_ID,
} from './models/note'

const effects = {}

export const notes = {
  state: {
    byId: createInitialNotesByIdState(),
    parentIds: {},
    root: ({ byId }) => byId[ROOT_NOTE_ID],
    rootChildren: ({ byId, root }) => root.childIds.map(cid => byId[cid]),
  },
  actions: {
    addNewNote({ state: { byId, parentIds, root } }) {
      const n = createNewNote()
      byId[n.id] = n
      appendChildId(n.id, root)
      parentIds[n.id] = root.id
    },
  },
  effects,
}

const overmind = new Overmind(notes, {
  name: 'Overmind Notes',
})

window._on = overmind

export const useOvermind = createHook(overmind)
