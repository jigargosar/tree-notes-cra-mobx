import React from 'react'
import { DefaultButton, FocusZone } from 'office-ui-fabric-react'
import { observer } from 'mobx-react'
import {
  addDisposer,
  getParentOfType,
  getSnapshot,
  onPatch,
  types as t,
} from 'mobx-state-tree'
import * as faker from 'faker'
import * as nanoid from 'nanoid'
import { autorun } from 'mobx'
import * as R from 'ramda'

const ROOT_NOTE_ID = 'ROOT_NOTE_ID'

let Note = t
  .model('Note', {
    _id: t.optional(t.identifier, () => `N__${nanoid()}`),
    title: t.optional(t.string, () => faker.name.lastName(null)),
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
    title: 'HOO',
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
          console.group('Store Updated')
          console.log('Root ChildIds:', self.root.childCount)
          console.table(getSnapshot(self.root.childIds))
          const allNotes = R.values(getSnapshot(self.byId))
          console.log('All Notes:', allNotes.length)
          console.table(allNotes)
          const parentIds = getSnapshot(self.parentIds)
          console.log('ParentIds:')
          console.table(parentIds)
          console.groupEnd()
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

const App = observer(() => (
  <FocusZone isCircularNavigation={true}>
    <div className="w-80 center sans-serif">
      <div className="mt3 f4 ttu tracked">Tree Notes</div>
      <div className="mt3 flex">
        <DefaultButton text="delete all" />
        <DefaultButton className="ml3" text="add" onClick={store.add} />
      </div>
      <div className="mt3">{store.title}</div>
    </div>
  </FocusZone>
))

export default App
