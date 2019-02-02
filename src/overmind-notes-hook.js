import { Overmind } from 'overmind'
import { createHook } from 'overmind-react'
import {
  createInitialNotesByIdState,
  createNewNote,
  noteChildCt,
  ROOT_NOTE_ID,
} from './models/note'

const overmind = new Overmind(
  {
    state: {
      notes: createInitialNotesByIdState(),
      parentIds: {},
      root: ({ notes: byId }) => byId[ROOT_NOTE_ID],
      rootChildren: ({ notes: byId, root }) =>
        root.childIds.map(cid => byId[cid]),
    },
    actions: {
      onAddNewNote: ({
        value: ev,
        state: { notes: byId, root, parentIds },
      }) => {
        const n = createNewNote()
        byId[n.id] = n
        root.childIds.splice(noteChildCt(root), 0, n.id)
        parentIds[n.id] = root.id
      },
    },
    effects: {},
  },
  { name: 'Overmind Notes' },
)

export const useOvermindNotes = createHook(overmind)
