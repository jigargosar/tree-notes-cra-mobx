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

function createInitialState() {
  return {
    byId: createInitialNotesByIdState(),
    parentIds: {},
    selectedId: null,
  }
}

const cacheStateProps = ['byId', 'selectedId']
const pickCacheStateProps = R.pick(cacheStateProps)
const isCacheStatePath = R.anyPass(R.map(R.startsWith)(cacheStateProps))

export const notes = {
  onInitialize: ({ state, effects, actions }) => {
    Object.assign(state, pickCacheStateProps(effects.getCachedState()))
    actions.populateParentIds()
  },
  state: {
    ...createInitialState(),
    root: ({ byId }) => byId[ROOT_NOTE_ID],
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
    cacheState: pipe(
      debounce(1000),
      action(({ state, effects }) => {
        effects.cacheState(state)
      }),
    ),
    deleteAll: ({ state }) => {
      state.byId = createInitialNotesByIdState()
      state.parentIds = {}
    },
  },
  effects: {
    cacheState(state) {
      cache('state', pickCacheStateProps(state))
    },
    getCachedState() {
      return R.pipe(
        getCachedOr,
        pickCacheStateProps,
      )(createInitialState, 'state')
    },
  },
}

const overmind = new Overmind(notes, {
  name: 'Overmind Notes',
})

overmind.addMutationListener(mutation => {
  if (isCacheStatePath(mutation.path)) {
    overmind.actions.cacheState()
  }
})

window._on = overmind

export const useOvermind = createHook(overmind)
