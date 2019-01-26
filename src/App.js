import React from 'react'
import { DefaultButton, FocusZone } from 'office-ui-fabric-react'
import { observer, useObservable } from 'mobx-react-lite'
import * as faker from 'faker'
import * as nanoid from 'nanoid'
import { observable } from 'mobx'

const ROOT_NOTE_ID = 'ROOT_NOTE_ID'

function newNoteId() {
  return `N__${nanoid()}`
}

function newNoteTitle() {
  return faker.name.lastName(null)
}

const initialRootNote = {
  id: ROOT_NOTE_ID,
  title: 'Root Note',
  childIds: [],
}

function createNewNote() {
  return {
    id: newNoteId(),
    title: newNoteTitle(),
    childIds: [],
  }
}

const App = observer(function AppInner() {
  const nt = useObservable({
    byId: observable.map({ ROOT_NOTE_ID: initialRootNote }),
    parentIds: observable.map({ ROOT_NOTE_ID: null }),
    get count() {
      return nt.byId.size
    },
    get rootChildIds() {
      return nt.get(ROOT_NOTE_ID).childIds
    },
    get: id => nt.byId.get(id),
    add({ pid = ROOT_NOTE_ID, idx = 0 } = {}) {
      const newNote = createNewNote()
      const newId = newNote.id
      nt.byId.set(newId, newNote)
      nt.parentIds.set(newId, pid)
      nt.get(pid).childIds.splice(idx, 0, newId)
    },
    onAddClicked() {
      nt.add()
    },
    displayTitle: id => nt.get(id).title,
  })

  return (
    <FocusZone isCircularNavigation={true}>
      <div className="w-80 center sans-serif">
        <div className="mt3 f4 ttu tracked">Tree Notes</div>
        <div className="mt3 flex">
          <DefaultButton text="delete all" />
          <DefaultButton
            className="ml3"
            text="add"
            onClick={nt.onAddClicked}
          />
        </div>
        <div className="mt3">{nt.count}</div>
        <div className="mt3">
          {nt.rootChildIds.map(id => (
            <div key={id}>
              <div>{id}</div>
              <div>{nt.displayTitle(id)}</div>
            </div>
          ))}
        </div>
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
