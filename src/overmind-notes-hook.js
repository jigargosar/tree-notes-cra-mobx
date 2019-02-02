import { Overmind } from 'overmind'
import { createHook } from 'overmind-react'
import {
  createInitialNotesByIdState,
  createNewNote,
  ROOT_NOTE_ID,
} from './models/note'
import * as R from 'ramda'

const overmind = new Overmind(
  {
    state: {
      notes: createInitialNotesByIdState(),
      rootNote: ({ notes }) => notes[ROOT_NOTE_ID],
      rootChildren: ({ notes, rootNote }) =>
        rootNote.childIds.map(cid => notes[cid]),
    },
    actions: {
      addNew: ({ value, state }) => {
        console.log(`value`, value)
        function setNotes(fn) {
          state.notes = fn(state.notes)
        }

        const n = createNewNote()

        setNotes(R.mergeRight({ [n.id]: n }))
        const overRootChildIds = R.over(
          R.lensPath([ROOT_NOTE_ID, 'childIds']),
        )
        setNotes(overRootChildIds(R.append(n.id)))
        // setParentIds(R.mergeRight({ [n.id]: ROOT_NOTE_ID }))
      },
    },
    effects: {},
  },
  { name: 'Overmind Notes' },
)

export const useOvermindNotes = createHook(overmind)
