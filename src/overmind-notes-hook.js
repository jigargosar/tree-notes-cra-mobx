import { Overmind } from 'overmind'
import { createHook } from 'overmind-react'
import {
  createInitialNotesByIdState,
  createNewNote,
  ROOT_NOTE_ID,
} from './models/note'

const overmind = new Overmind(
  {
    state: {
      notes: createInitialNotesByIdState(),
      parentIds: {},
      rootNote: ({ notes }) => notes[ROOT_NOTE_ID],
      rootChildren: ({ notes, rootNote }) =>
        rootNote.childIds.map(cid => notes[cid]),
    },
    actions: {
      onAddNewNote: ({ value: ev, state }) => {
        const byId = state.notes
        // ev.persist()
        console.log(`value`, ev)
        // function setNotes(fn) {
        //   state.notes = fn(state.notes)
        // }

        const n = createNewNote()
        byId[n.id] = n
        // setNotes(R.mergeRight({ [n.id]: n }))

        const root = state.rootNote

        root.childIds.splice(root.childIds.length, 0, n.id)

        // const overRootChildIds = R.over(
        //   R.lensPath([ROOT_NOTE_ID, 'childIds']),
        // )
        //
        // setNotes(overRootChildIds(R.append(n.id)))

        // setParentIds(R.mergeRight({ [n.id]: ROOT_NOTE_ID }))
        state.parentIds[n.id] = root.id
      },
    },
    effects: {},
  },
  { name: 'Overmind Notes' },
)

export const useOvermindNotes = createHook(overmind)
