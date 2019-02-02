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
      root: ({ notes }) => notes[ROOT_NOTE_ID],
      rootChildren: ({ notes, root }) =>
        root.childIds.map(cid => notes[cid]),
    },
    actions: {
      onAddNewNote: ({ value: ev, state }) => {
        const byId = state.notes
        // ev.persist()
        console.log(`value`, ev)
        const n = createNewNote()
        byId[n.id] = n
        const root = state.root

        root.childIds.splice(noteChildCt(root), 0, n.id)

        state.parentIds[n.id] = root.id
      },
    },
    effects: {},
  },
  { name: 'Overmind Notes' },
)

export const useOvermindNotes = createHook(overmind)
