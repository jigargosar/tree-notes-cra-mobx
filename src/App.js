import React from 'react'
import * as R from 'ramda'
import { observer } from 'mobx-react-lite'
import { createInitialNotesByIdState } from './models/note'
import { autorun } from 'mobx'
import { cache } from './utils'

class NoteTree {
  byId = createInitialNotesByIdState()
  parentIds = {}
  selectedId = null

  constructor() {
    autorun(() => {
      cache('noteTree', R.pick(['byId', 'selectedId'])(this))
    })
  }
}

const nt = new NoteTree()

const RootTree = observer(() => {
  return <div className="">RT</div>
})

const App = observer(() => {
  return (
    <div className="w-80 center sans-serif">
      <div className="pv3 f4 ttu tracked">Tree Notes</div>
      <div className="pv1">
        <button className="" onClick={R.identity}>
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
