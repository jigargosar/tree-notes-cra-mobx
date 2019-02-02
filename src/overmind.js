import { action, debounce, Overmind, pipe } from 'overmind'
import { createHook } from 'overmind-react'
import { cache, getCachedOr } from './utils'

import {
  appendChildId,
  createInitialNotesByIdState,
  createNewNote,
  ROOT_NOTE_ID,
} from './models/note'
import * as R from 'ramda'

function getInitialState() {
  return {
    byId: createInitialNotesByIdState(),
    parentIds: {},
    selectedId: null,
  }
}

export const notes = {
  onInitialize: ({ state, effects, actions }) => {
    state.byId = effects.getCachedNotes()
    actions.populateParentIds()
  },
  state: {
    ...getInitialState(),
    root: ({ byId }) => byId[ROOT_NOTE_ID],
    rootChildren: ({ byId, root }) => root.childIds.map(cid => byId[cid]),
    allNotes: ({ byId }) => Object.values(byId),
  },
  actions: {
    toggleCollapsed: ({ value: id, state: { byId } }) => {
      const note = byId[id]
      note.collapsed = !note.collapsed
    },
    selectNoteId: ({ value: id, state }) => {
      state.selectedId = id
    },
    populateParentIds: ({ state }) => {
      state.parentIds = {}
      const { parentIds, allNotes } = state
      allNotes.forEach(n => {
        n.childIds.forEach(cid => {
          parentIds[cid] = n.id
        })
      })
    },
    appendNewNoteTo({ value: pid, state: { byId, parentIds } }) {
      const parent = byId[pid]
      const n = createNewNote()
      byId[n.id] = n
      appendChildId(n.id, parent)
      parentIds[n.id] = parent.id
    },
    addNewNote({ state: { selectedId }, actions }) {
      actions.appendNewNoteTo(selectedId || ROOT_NOTE_ID)
    },
    cacheNotes: pipe(
      debounce(1000),
      action(({ state: { byId }, effects }) => {
        effects.cacheNotes(byId)
      }),
    ),
    cacheState: pipe(
      debounce(1000),
      action(({ state, effects }) => {
        const toStaticState = R.pick(R.keys(getInitialState()))
        effects.cacheState(toStaticState(state))
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
    cacheState(state) {
      cache('state', state)
    },
    getCachedState() {
      getCachedOr(createInitialNotesByIdState, 'state')
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
  overmind.actions.cacheState()
})

window._on = overmind

export const useOvermind = createHook(overmind)
