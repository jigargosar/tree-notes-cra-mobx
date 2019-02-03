import React from 'react'
import * as R from 'ramda'
import { observer } from 'mobx-react-lite'
import {
  createInitialNotesByIdState,
  createNewNote,
  ROOT_NOTE_ID,
} from './models/note'
import { autorun, extendObservable, observable, toJS } from 'mobx'
import { cache, getCachedOr } from './utils'

const enhanceNote = R.curry(function enhanceNote(tree, note) {
  return extendObservable(note, {
    get isLeaf() {
      return note.childIds.length === 0
    },
    get hasChildren() {
      return !this.isLeaf
    },
    toggleCollapse() {
      this.collapsed = !this.collapsed
    },
    get showChildren() {
      return this.hasChildren && !this.collapsed
    },
    get isSelected() {
      return tree.selectedId === note.id
    },
    setSelected() {
      tree.setSelected
    },
  })
})

function createNoteTree() {
  const tree = observable({
    byId: {},
    parentIds: {},
    selectedId: null,
  })

  init()

  const root = get(ROOT_NOTE_ID)

  const api = { add, get, root, addAfter, setSelected }

  function createEnhancedNote() {
    return enhanceNote(createNewNote(), api)
  }

  function init() {
    const { byId, selectedId } = getCachedOr(() => ({}), 'noteTree')

    const byIdNotes = byId || createInitialNotesByIdState()
    tree.byId = R.mapObjIndexed(enhanceNote(tree))(byIdNotes)
    tree.selectedId = selectedId || null

    autorun(() => {
      cache('noteTree', toJS(tree))
    })
  }

  function setSelected(n) {
    tree.selectedId = n.id
  }

  function get(id) {
    return tree.byId[id]
  }

  function add() {
    addTo(ROOT_NOTE_ID)
  }

  function addTo(pid) {
    const n = createEnhancedNote()
    tree.byId[n.id] = n
    tree.parentIds[n.id] = pid
    tree.selectedId = n.id
    get(pid).childIds.push(n.id)
  }

  function addAfter(sid) {
    const n = createEnhancedNote()
    tree.byId[n.id] = n
    const pid = tree.parentIds[sid]
    tree.parentIds[n.id] = pid
    tree.selectedId = n.id
    const childIds = get(pid).childIds
    childIds.splice(childIds.indexOf(sid), n.id)
  }

  return api
}

const nt = createNoteTree()

const NoteItem = observer(({ id }) => {
  const note = nt.get(id)

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
      <div className="flex items-center" onClick={note.setSelected}>
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
          onFocus={note.setSelected}
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

const RootTree = observer(() => {
  return (
    <div className="">
      {nt.root.childIds.map(id => (
        <NoteItem key={id} id={id} />
      ))}
    </div>
  )
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
