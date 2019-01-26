import React from 'react'
import { DefaultButton, FocusZone } from 'office-ui-fabric-react'
import { observer } from 'mobx-react-lite'
import * as faker from 'faker'
import * as nanoid from 'nanoid'
import { observable } from 'mobx'

const ROOT_NOTE_ID = 'ROOT_NOTE_ID'

const initialRootNote = {
  id: ROOT_NOTE_ID,
  title: 'Root Note',
  childIds: [],
}

function newNoteId() {
  return `N__${nanoid()}`
}

function newNoteTitle() {
  return faker.name.lastName(null)
}

function createNewNote() {
  return {
    id: newNoteId(),
    title: newNoteTitle(),
    childIds: [],
  }
}

const nt = observable({
  byId: observable.map({ ROOT_NOTE_ID: initialRootNote }),
  parentIds: observable.map({ ROOT_NOTE_ID: null }),
  get count() {
    return nt.byId.size
  },
  get rootChildIds() {
    return nt.childIdsOf(ROOT_NOTE_ID)
  },
  childIdsOf: pid => nt.get(pid).childIds,
  get: id => nt.byId.get(id),
  add({ pid = ROOT_NOTE_ID, idx = 0 } = {}) {
    const newNote = createNewNote()
    const newId = newNote.id
    nt.byId.set(newId, newNote)
    nt.parentIds.set(newId, pid)
    nt.get(pid).childIds.splice(idx, 0, newId)
  },
  onAdd() {
    nt.add()
  },
  displayTitle: id => nt.get(id).title,
})

const NoteItem = observer(({ id }) => {
  return (
    <div>
      {/* Title */}
      <div>
        <div className="code f6 flex items-center">
          <div className="code f6">{id.substring(0, 7)}</div>
          <div className="ml3 code f6">
            <DefaultButton
              onClick={() => nt.add({ pid: id, idx: 0 })}
              text={'Insert Child'}
            />
          </div>
        </div>
        <div>{nt.displayTitle(id)}</div>
      </div>
      {/*  Children */}
      <div className="ml3">
        {nt.childIdsOf(id).map(id => (
          <NoteItem key={id} id={id} nt={nt} />
        ))}
      </div>
    </div>
  )
})

const App = observer(function AppInner() {
  return (
    <FocusZone isCircularNavigation={true}>
      <div className="w-80 center sans-serif">
        <div className="mt3 f4 ttu tracked">Tree Notes</div>
        <div className="mt3 flex items-center">
          <DefaultButton text="delete all" />
          <DefaultButton className="ml3" text="add" onClick={nt.onAdd} />
          <div className="ml3">{`total: ${nt.count}`}</div>
        </div>
        <div className="mt3">
          {nt.rootChildIds.map(id => (
            <NoteItem key={id} id={id} />
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
