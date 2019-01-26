import React from 'react'
import { DefaultButton, FocusZone } from 'office-ui-fabric-react'
import { observer, useObservable } from 'mobx-react-lite'
import {
  addDisposer,
  addMiddleware,
  getParentOfType,
  onPatch,
  types as t,
} from 'mobx-state-tree'
import * as faker from 'faker'
import * as nanoid from 'nanoid'
import { autorun, observable, trace } from 'mobx'

import { actionLogger } from 'mst-middlewares'

const ROOT_NOTE_ID = 'ROOT_NOTE_ID'

function newNoteId() {
  return `N__${nanoid()}`
}

function newNoteTitle() {
  return faker.name.lastName(null)
}

let Note = t
  .model('Note', {
    _id: t.optional(t.identifier, newNoteId),
    title: t.optional(t.string, newNoteTitle),
    childIds: t.array(t.string),
  })
  .views(self => ({
    get id() {
      return self._id
    },
    get childCount() {
      return self.childIds.length
    },
  }))
  .actions(self => ({
    afterAttach() {
      addDisposer(
        self,
        onPatch(self, ({ path }) => {
          trace(self, 'childIds', true)
          if (path.startsWith('/childIds')) {
            getParentOfType(self, Store).noteChildIdsChanged(self)
          }
        }),
      )
    },
    newAt(idx = 0) {
      const newNote = Note.create()
      self.childIds.splice(idx, 0, newNote.id)
      return newNote
    },
  }))

const Store = t
  .model('Store', {
    title: 'HAL',
    byId: t.map(Note),
    parentIds: t.map(t.string),
  })
  .views(self => {
    return {
      get(id) {
        return self.byId.get(id)
      },
      get root() {
        return self.get(ROOT_NOTE_ID)
      },
      get totalCount() {
        return self.byId.size
      },
    }
  })
  .actions(self => ({
    afterCreate() {
      if (!self.root) {
        const rootNote = Note.create({
          _id: ROOT_NOTE_ID,
          title: 'Root Note',
          childIds: [],
        })
        self.byId.put(rootNote)
      }
      addDisposer(
        self,
        autorun(() => {
          // console.groupCollapsed('Store Updated')
          // console.log('Root ChildIds:', self.root.childCount)
          // console.table(getSnapshot(self.root.childIds))
          // const allNotes = R.values(getSnapshot(self.byId))
          // console.log('All Notes:', allNotes.length)
          // console.table(allNotes)
          // const parentIds = getSnapshot(self.parentIds)
          // console.log('ParentIds:')
          // console.table(parentIds)
          // console.groupEnd()
        }),
      )
    },
    noteChildIdsChanged(note) {
      note.childIds.forEach(cid => {
        self.parentIds.set(cid, note.id)
      })
    },
    add() {
      const newNote = self.root.newAt(0)
      self.byId.put(newNote)
    },
  }))

const store = Store.create()
window.store = store
addMiddleware(store, actionLogger)
onPatch(store, patch => console.log(patch))

const rootNote = {
  id: ROOT_NOTE_ID,
  title: 'Root Note',
  childIds: [],
}

const App = observer(function AppInner() {
  const nt = useObservable({
    byId: observable.map({ [rootNote.id]: rootNote }),
    parentIds: observable.map({ [rootNote.id]: null }),
    get count() {
      return nt.byId.size
    },
    get: id => nt.byId.get(id),
    _add({ pid = ROOT_NOTE_ID, idx = 0 } = {}) {
      const newId = newNoteId()
      nt.byId.set(newId, {
        id: newId,
        title: newNoteTitle(),
        childIds: [],
      })
      nt.parentIds.set(newId, pid)
      nt.get(pid).childIds.splice(idx, 0, newId)
    },
    onAddClicked() {
      nt._add()
    },
  })

  return (
    <FocusZone isCircularNavigation={true}>
      <div className="w-80 center sans-serif">
        <div className="mt3 f4 ttu tracked">Tree Notes</div>
        <div className="mt3 flex">
          <DefaultButton text="delete all" />
          <DefaultButton className="ml3" text="add" onClick={store.add} />
          <DefaultButton
            className="ml3"
            text="add"
            onClick={nt.onAddClicked}
          />
        </div>
        <div className="mt3">{store.title}</div>
        <div className="mt3">{store.totalCount}</div>
        <div className="mt3">{nt.count}</div>
      </div>
    </FocusZone>
  )
})

export default App

// spy(event => {
//   console.log('SPY', event)
//   if (event.type === 'action') {
//     console.log(`${event.name} with args: ${event.arguments}`)
//   }
// })
