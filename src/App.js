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

function createNoteTree() {
  const nt = observable({
    byId: {},
    parentIds: {},
    selectedId: null,
  })

  const init = () => {
    const { byId, selectedId } = getCachedOr(() => ({}), 'noteTree')

    nt.byId = byId || createInitialNotesByIdState()
    nt.selectedId = selectedId || null

    autorun(() => {
      cache('noteTree', toJS(nt))
    })
  }

  function add() {
    addTo(ROOT_NOTE_ID)
  }

  function addTo(pid) {
    const n = createNewNote()
    nt.byId[n.id] = n
    nt.parentIds[n.id] = pid
    nt.selectedId = n.id
    nt.byId[pid].childIds.push(n.id)
  }

  init()

  return { add }
}

const nt = createNoteTree()

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
