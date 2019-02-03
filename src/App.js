import React from 'react'
import * as R from 'ramda'
import { observer } from 'mobx-react-lite'
import {
  createInitialNotesByIdState,
  createNewNote,
  ROOT_NOTE_ID,
} from './models/note'
import { autorun, observable, toJS } from 'mobx'
import { cache, getCachedOr } from './utils'

// const pickState = R.pick(['byId', 'parentIds', 'selectedId'])

class NoteTree {
  byId = observable.object({})
  parentIds = observable.object({})
  selectedId = observable.ref

  constructor() {
    const { byId, selectedId } = getCachedOr(() => ({}), 'noteTree')

    this.byId = byId || createInitialNotesByIdState()
    this.selectedId = selectedId || null

    autorun(() => {
      cache('noteTree', toJS(this))
    })
  }

  add = () => {
    const n = createNewNote()
    this.byId[n.id] = n
    this.parentIds[n.id] = ROOT_NOTE_ID
    this.selectedId = n.id
  }
}

// decorate(NoteTree, {
//   byId: observable,
//   parentIds: observable,
//   selectedId: observable,
// })

const nt = new NoteTree()

const RootTree = observer(() => {
  return <div className="">RT</div>
})

const App = observer(() => {
  return (
    <div className="w-80 center sans-serif">
      <div className="pv3 f4 ttu tracked">Tree Notes</div>
      <div className="pv1">
        <button className="" onClick={() => nt.add()}>
          add
        </button>
        <button className="ml3" onClick={R.identity}>
          delete all
        </button>
      </div>
      <div className="pv3">
        <RootTree />
      </div>
    </div>
  )
})
export default App
