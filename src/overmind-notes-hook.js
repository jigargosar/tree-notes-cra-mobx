import { Overmind } from 'overmind'
import { createHook } from 'overmind-react'
import {
  createInitialNotesByIdState,
  createNewNote,
  ROOT_NOTE_ID,
} from './models/note'

function insertAt(start, item, arr) {
  arr.splice(start, 0, item)
}

function appendChildId(cid, parent) {
  insertAt(parent.childIds.length, cid, parent.childIds)
}

class No {
  constructor() {
    this.a = 1
  }

  toString() {
    return `No(a=${this.a})`
  }
}

const overmind = new Overmind(
  {
    state: {
      no: new No(),
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
        appendChildId(n.id, root)
        parentIds[n.id] = root.id
      },
    },
    effects: {},
  },
  { name: 'Overmind Notes' },
)

window.ov = overmind

export const useOvermindNotes = createHook(overmind)
