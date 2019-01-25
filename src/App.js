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
      get root() {
        return self.byId.get(ROOT_NOTE_ID)
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
          console.table(getSnapshot(self.root))
          console.table(R.values(getSnapshot(self.byId)))
        }),
      )
    },
    add() {
      const newNote = self.root.newAt(0)
      self.byId.put(newNote)
      console.table(`self.root.childIds`, self.root.childIds.toJSON())
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
