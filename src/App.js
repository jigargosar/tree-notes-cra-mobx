import React, { createRef } from 'react'
import * as R from 'ramda'
import { observer, useComputed } from 'mobx-react-lite'
import {
  createInitialNotesByIdState,
  createNewNote,
  ROOT_NOTE_ID,
} from './models/note'
import { autorun, extendObservable, observable, toJS } from 'mobx'
import { cache, getCachedOr } from './utils'
import { useArrowKeys } from './hooks'

window.mobx = require('mobx')

const enhanceNote = R.curry(function enhanceNote(tree, note) {
  const id = note.id
  return extendObservable(
    note,
    {
      get isSelected() {
        return id === nt.selectedId
      },
      select() {
        nt.setSelectedId(id)
      },
      get isLeaf() {
        return note.childIds.length === 0
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
    },
    {},
    { name: 'Note:' + id },
  )
})

function createNoteTree() {
  const tree = observable.object(
    {
      byId: {},
      parentIds: {},
      selectedId: null,
      get root() {
        return get(ROOT_NOTE_ID)
      },
    },
    null,
    { name: 'NoteTree' },
  )

  function init() {
    const { byId, selectedId } = getCachedOr(() => ({}), 'noteTree')

    const byIdNotes = byId || createInitialNotesByIdState()
    tree.byId = R.mapObjIndexed(enhanceNote(tree))(byIdNotes)
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
    appendTo(ROOT_NOTE_ID)
  }

  function createNewEnhancedNote() {
    return enhanceNote(tree, createNewNote())
  }

  function appendTo(pid) {
    const n = createNewEnhancedNote()
    tree.byId[n.id] = n
    tree.parentIds[n.id] = pid
    setSelectedId(n.id)
    get(pid).childIds.push(n.id)
  }

  function addAfter(sid = tree.selectedId) {
    if (!sid) return
    const n = createNewNote()
    tree.byId[n.id] = n
    const pid = tree.parentIds[sid]
    tree.parentIds[n.id] = pid
    setSelectedId(n.id)
    const childIds = get(pid).childIds
    childIds.splice(childIds.indexOf(sid), n.id)
  }

  init()
  return extendObservable(tree, {
    add,
    get,
    addAfter,
    setSelectedId,
    deleteAll() {
      tree.byId = createInitialNotesByIdState()
      tree.selectedId = null
      tree.parentIds = {}
    },
  })
}

const nt = createNoteTree()

window.nt = nt

const NoteItem = observer(function NoteItem({ id }) {
  const note = useComputed(() => nt.get(id))

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
          tabIndex={note.isSelected ? 0 : -1}
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
  return (
    <div className="">
      {nt.root.childIds.map(id => (
        <NoteItem key={id} id={id} />
      ))}
    </div>
  )
})

const ButtonBar = observer(({ buttons }) => {
  return (
    <div className="pv1">
      {buttons.map(({ title, op }) => (
        <button key={title} className="ml3" {...op}>
          {title}
        </button>
      ))}
    </div>
  )
})
const App = observer(function App() {
  const navContainerRef = createRef()
  useArrowKeys(navContainerRef)
  return (
    <div className="w-80 center sans-serif">
      <div className="pv3 f4 ttu tracked">Tree Notes</div>
      <ButtonBar buttons={[{ title: 'add', onClick: nt.add }]} />
      <div className="pv1">
        <button className="" onClick={() => nt.add()}>
          add
        </button>
        <button className="ml3" onClick={nt.deleteAll}>
          delete all
        </button>
        <button className="ml3" onClick={nt.deleteAll}>
          delete all
        </button>
      </div>
      <div ref={navContainerRef} className="pv3">
        <RootTree />
      </div>
    </div>
  )
})
export default App
