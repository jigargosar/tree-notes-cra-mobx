import React from 'react'
import { DefaultButton, FocusZone } from 'office-ui-fabric-react'
import { observer } from 'mobx-react'
import { addDisposer, getSnapshot, types as t } from 'mobx-state-tree'
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
  }))
  .actions(self => ({
    addNew() {
      const newNote = Note.create()

      // self.parentIds.set(newId, self.root.id)
      // self.byId.put(newNote)
      const newId = newNote.id
      self.childIds.unshift(newId)
    },
    insertChildIdAt(idx, childId) {
      const clampedChildIdx = R.clamp(0, self.childIds.length)(idx)
      self.childIds = R.insert(clampedChildIdx)(childId)(self.childIds)
    },
  }))

const Store = t
  .model('Store', {
    title: 'HOO',
    byId: t.map(Note),
    parentIds: t.map(t.string),
  })
  .views(self => ({
    get root() {
      return Note.create({
        _id: ROOT_NOTE_ID,
        title: 'Root Note',
        childIds: [],
      })
    },
  }))
  .actions(self => ({
    afterCreate() {
      addDisposer(
        self,
        autorun(() => {
          const snapshot = getSnapshot(self)
          console.log(`getSnapshot(self)`, snapshot)
          console.table(snapshot.parentIds)
          console.table(R.values(snapshot.byId))
        }),
      )
    },
    addNew() {
      const newNote = Note.create()

      self.byId.put(newNote)
      const newId = newNote.id
      self.root.insertChildIdAt(0, newId)
      self.parentIds.set(newId, self.root.id)
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
        <DefaultButton className="ml3" text="add" onClick={store.addNew} />
      </div>
      <div className="mt3">{store.title}</div>
    </div>
  </FocusZone>
))

export default App
