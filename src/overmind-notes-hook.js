import { Overmind } from 'overmind'
import { namespaced } from 'overmind/config'
import { createHook } from 'overmind-react'
import {
  appendChildId,
  createInitialNotesByIdState,
  createNewNote,
  ROOT_NOTE_ID,
} from './models/note'

const notes = {
  state: {
    byId: createInitialNotesByIdState(),
    parentIds: {},
    root: ({ byId }) => byId[ROOT_NOTE_ID],
    rootChildren: ({ byId, root }) => root.childIds.map(cid => byId[cid]),
  },
  actions: {
    addNewNote: ({
      state: {
        notes: { byId, parentIds, root },
      },
    }) => {
      const n = createNewNote()
      byId[n.id] = n
      appendChildId(n.id, root)
      parentIds[n.id] = root.id
    },
  },
  effects: {},
}

const overmind = new Overmind(namespaced({ notes }), {
  name: 'Overmind Notes',
})

window.ov = overmind

export const useOvermindNotes = createHook(overmind)
