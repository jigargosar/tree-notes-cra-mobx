import React, { createRef } from 'react'
import * as R from 'ramda'
import { observer } from 'mobx-react-lite'
import {
  createInitialNotesByIdState,
  createNewNote,
  ROOT_NOTE_ID,
} from './models/note'
import { autorun, extendObservable, observable, toJS } from 'mobx'
import { cache, getCachedOr } from './utils'
import { useArrowKeys } from './hooks'
import { createObjMap } from './mobx/objMap'

window.mobx = require('mobx')

const enhanceNote = R.curry(function enhanceNote(tree, note) {
  const id = note.id
  return extendObservable(
    observable.object(note),
    {
      get isSelected() {
        return id === nt.selectedId
      },
      select() {
        tree.setSelectedId(id)
      },
      get isLeaf() {
        return note.childIds.length === 0
      },
      get hasChildren() {
        return !note.isLeaf
      },
      get showChildren() {
        return note.hasChildren && !note.collapsed
      },
      toggleCollapse() {
        note.collapsed = !note.collapsed
      },
      get firstChildId() {
        return note.hasChildren ? note.childIds[0] : null
      },
    },
    null,
    { name: 'Note:' + id },
  )
})

function createNoteTree() {
  const tree = observable.object(
    {
      idMap: createObjMap({}),
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
    const { byId, selectedId, parentIds } = getCachedOr(
      () => ({}),
      'noteTree',
    )

    const byIdNotes = byId || createInitialNotesByIdState()
    tree.byId = R.mapObjIndexed(enhanceNote(tree))(byIdNotes)
    tree.parentIds = parentIds || {}
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

  function insert(n) {
    tree.byId[n.id] = n
  }

  function prepend() {
    prependTo(ROOT_NOTE_ID)
  }

  function createNewEnhancedNote() {
    return enhanceNote(tree, createNewNote())
  }

  function appendTo(pid) {
    const n = createNewEnhancedNote()
    insert(n)
    tree.parentIds[n.id] = pid
    setSelectedId(n.id)
    get(pid).childIds.push(n.id)
  }

  function prependTo(pid) {
    const n = createNewEnhancedNote()
    insert(n)
    tree.parentIds[n.id] = pid
    setSelectedId(n.id)
    get(pid).childIds.unshift(n.id)
  }

  function addAfter(sid) {
    const n = createNewEnhancedNote()
    insert(n)
    const pid = tree.parentIds[sid]
    tree.parentIds[n.id] = pid
    setSelectedId(n.id)
    const childIds = get(pid).childIds
    childIds.splice(childIds.indexOf(sid) + 1, 0, n.id)
  }

  function addAfterSelected() {
    const sid = tree.selectedId || tree.root.firstChildId
    if (sid) {
      addAfter(sid)
    } else {
      prepend()
    }
  }

  init()
  return extendObservable(tree, {
    prepend,
    get,
    addAfter: addAfterSelected,
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
    <div className="mv3 nl3">
      {buttons.map(({ title, ...op }) => (
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

  const buttonConfigToButtons = R.pipeWith(R.call, [
    R.mapObjIndexed((onClick, title) => ({
      title,
      onClick,
    })),
    R.values,
  ])

  const buttonConfig = buttonConfigToButtons({
    add: nt.addAfter,
    'delete all': nt.deleteAll,
    'append to root': nt.prepend,
  })
  console.log(`buttonConfig`, buttonConfig)
  return (
    <div className="w-80 center sans-serif">
      <div className="pv3 f4 ttu tracked">Tree Notes</div>

      <ButtonBar buttons={buttonConfig} />

      <div ref={navContainerRef} className="pv3">
        <RootTree />
      </div>
    </div>
  )
})

export default App
