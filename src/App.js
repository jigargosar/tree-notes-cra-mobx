import React from 'react'
import * as R from 'ramda'
import { observer, useObservable } from 'mobx-react-lite'
import {
  createInitialNotesByIdState,
  createNewNote,
  ROOT_NOTE_ID,
} from './models/note'
import { autorun, extendObservable, observable, toJS } from 'mobx'
import { cache, getCachedOr } from './utils'

// const enhanceNote = R.curry(function enhanceNote(note) {
//   return extendObservable(note, {
//     get isLeaf() {
//       return note.childIds.length === 0
//     },
//     get hasChildren() {
//       return !this.isLeaf
//     },
//     get showChildren() {
//       return this.hasChildren && !this.collapsed
//     },
//     function() {
//       note.collapsed = !note.collapsed
//     },
//   })
// })

function createNoteTree() {
  const tree = observable.object({
    byId: {},
    parentIds: {},
    selectedId: null,
  })

  function init() {
    const { byId, selectedId } = getCachedOr(() => ({}), 'noteTree')

    const byIdNotes = byId || createInitialNotesByIdState()
    tree.byId = R.mapObjIndexed(R.identity)(byIdNotes)
    tree.selectedId = selectedId || null

    autorun(() => {
      cache('noteTree', toJS(tree))
    })
  }

  function setSelectedId(id) {
    tree.selectedId = id
  }

  function get(id) {
    return tree.byId[id]
  }

  function add() {
    addTo(ROOT_NOTE_ID)
  }

  function addTo(pid) {
    const n = createNewNote()
    tree.byId[n.id] = n
    tree.parentIds[n.id] = pid
    tree.selectedId = n.id
    get(pid).childIds.push(n.id)
  }

  function addAfter(sid) {
    const n = createNewNote()
    tree.byId[n.id] = n
    const pid = tree.parentIds[sid]
    tree.parentIds[n.id] = pid
    tree.selectedId = n.id
    const childIds = get(pid).childIds
    childIds.splice(childIds.indexOf(sid), n.id)
  }

  init()
  return extendObservable(tree, {
    add,
    get,
    addAfter,
    setSelectedId,
  })
}

const nt = createNoteTree()

function useNote(id) {
  const note = nt.get(id)
  return useObservable({
    get title() {
      return note.title
    },
    get childIds() {
      return note.childIds
    },
    get isLeaf() {
      return note.childIds.length === 0
    },
    get isSelected() {
      return id === nt.selectedId
    },
    get hasChildren() {
      return !this.isLeaf
    },
    get showChildren() {
      return this.hasChildren && !this.collapsed
    },
    toggleCollapse() {
      note.collapsed = !note.collapsed
    },
    select() {
      nt.setSelectedId(id)
    },
  })
}

function useRootNote() {
  return useNote(ROOT_NOTE_ID)
}

const NoteItem = observer(function NoteItem({ id }) {
  const note = useNote(id)

  const titleRef = React.createRef()

  React.useLayoutEffect(() => {
    const el = titleRef.current
    if (el && note.isSelected) {
      el.focus()
    }
  })

  return (
    <div>
      {/*header*/}
      <div className="flex items-center" onClick={note.select}>
        <div
          className={`ph2 code us-none ${note.isLeaf ? '' : 'pointer'}`}
          onClick={note.toggleCollapse}
        >
          {note.isLeaf ? 'o' : note.collapsed ? '+' : '-'}
        </div>
        {/*title*/}
        <div
          ref={titleRef}
          className={`flex-auto pv1 ph1 ${
            note.isSelected ? 'bg-light-blue' : ''
          }`}
          tabIndex={0}
          data-is-focusable={true}
          onFocus={note.select}
        >
          {note.title}
        </div>
      </div>
      {/*children*/}
      {note.showChildren && (
        <div className="ml3">
          {note.childIds.map(id => (
            <NoteItem key={id} id={id} />
          ))}
        </div>
      )}
    </div>
  )
})

const RootTree = observer(function RootTree() {
  const root = useRootNote()
  return (
    <div className="">
      {root.childIds.map(id => (
        <NoteItem key={id} id={id} />
      ))}
    </div>
  )
})

const App = observer(function App() {
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
