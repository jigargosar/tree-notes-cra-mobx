import { action, debounce, Overmind, pipe } from 'overmind'
import { createHook } from 'overmind-react'
import { cache, getCachedOr } from './utils'

import {
  appendChildId,
  createInitialNotesByIdState,
  createNewNote,
  ROOT_NOTE_ID,
} from './models/note'

export const notes = {
  onInitialize: ({ state, effects, actions }) => {
    state.byId = effects.getCachedNotes()
    actions.populateParentIds()
  },
  state: {
    byId: createInitialNotesByIdState(),
    parentIds: {},
    root: ({ byId }) => byId[ROOT_NOTE_ID],
    rootChildren: ({ byId, root }) => root.childIds.map(cid => byId[cid]),
    allNotes: ({ byId }) => Object.values(byId),
  },
  actions: {
    populateParentIds: ({ state }) => {
      state.parentIds = {}
      const { parentIds, allNotes } = state
      allNotes.forEach(n => {
        n.childIds.forEach(cid => {
          parentIds[cid] = n.id
        })
      })
    },
    addNewNote({ state: { byId, parentIds, root } }) {
      const n = createNewNote()
      byId[n.id] = n
      appendChildId(n.id, root)
      parentIds[n.id] = root.id
    },
    cacheNotes: pipe(
      debounce(1000),
      action(({ state: { byId }, effects }) => {
        effects.cacheNotes(byId)
      }),
    ),
    deleteAll: ({ state }) => {
      state.byId = createInitialNotesByIdState()
      state.parentIds = {}
    },
  },
  effects: {
    cacheNotes(notes) {
      cache('notes', notes)
    },
    getCachedNotes() {
      return getCachedOr(createInitialNotesByIdState, 'notes')
    },
  },
}

const overmind = new Overmind(notes, {
  name: 'Overmind Notes',
})

overmind.addMutationListener(mutation => {
  //console.log(`mutation`, mutation)

  if (mutation.path.startsWith('byId')) {
    overmind.actions.cacheNotes()
  }
})

window._on = overmind

export const useOvermind = createHook(overmind)
