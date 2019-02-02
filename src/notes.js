import {
  appendChildId,
  createInitialNotesByIdState,
  createNewNote,
  ROOT_NOTE_ID,
} from './models/note'

const state = {
  byId: createInitialNotesByIdState(),
  parentIds: {},
  root: ({ byId }) => byId[ROOT_NOTE_ID],
  rootChildren: ({ byId, root }) => root.childIds.map(cid => byId[cid]),
}

function addNewNote({
  state: {
    notes: { byId, parentIds, root },
  },
}) {
  const n = createNewNote()
  byId[n.id] = n
  appendChildId(n.id, root)
  parentIds[n.id] = root.id
}

const actions = {
  addNewNote,
}
const effects = {}

export const notes = {
  state,
  actions,
  effects,
}
