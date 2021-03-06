import React, { createRef } from 'react'
import * as R from 'ramda'
import { observer } from 'mobx-react-lite'
import {
  createInitialNotesByIdState,
  createNewNote,
  ROOT_NOTE_ID,
} from './models/note'
import * as mobx from 'mobx'
import {
  autorun,
  configure,
  extendObservable,
  observable,
  runInAction,
  toJS,
} from 'mobx'
import { getCachedOr_, setCache } from './dom-helpers'
import { handleArrowKeyNav } from './hooks/useArrowKeys'
import { useFocusRef } from './hooks/useFocus'
import {
  insertAtOffsetOf,
  moveItemByClampedOffset,
  removeByIndexOf,
  toggle,
  wrapActions,
} from './mobx/helpers'
import DevTools from 'mobx-react-devtools'
import isHotKey from 'is-hotkey'
import { focusRef } from './react-helpers'
import validate from 'aproba'

configure({ enforceActions: 'always' })
window.mobx = mobx

const enhanceNote = R.curry(function enhanceNote(tree, note) {
  note = observable.object(note)
  const id = note.id
  return extendObservable(
    note,
    {
      get isSelected() {
        return id === nt.selectedId
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
      get firstChildId() {
        return note.hasChildren ? note.childIds[0] : null
      },
      get isCollapsed() {
        return note.collapsed
      },
      get canCollapse() {
        return note.showChildren
      },
      get canExpand() {
        return note.hasChildren && note.isCollapsed
      },
      get isParentSelectable() {
        return tree.isParentOfIdSelectable(id)
      },

      get pid() {
        return tree.getPid(id)
      },

      get idx() {
        return tree.getIdx(id)
      },
      select() {
        tree.setSelectedId(id)
      },
      selectParent() {
        tree.selectParentOfId(id)
      },

      ...wrapActions({
        toggleCollapse() {
          toggle(note, 'collapsed')
        },
        expand() {
          note.collapsed = false
        },
        moveUp() {
          tree.moveSelectedBy(-1)
        },
        moveDown() {
          tree.moveSelectedBy(1)
        },
        nest() {
          tree.nest(id)
        },
        unNest() {
          tree.unNest(id)
        },
      }),
    },
    null,
    { name: 'Note:' + id },
  )
})

function createNoteTree() {
  function createInitialParentIds() {
    return {}
  }

  const tree = observable.object(
    {
      byId: {},
      parentIds: createInitialParentIds(),
      selectedId: null,
      get root() {
        return getNote(ROOT_NOTE_ID)
      },
    },
    null,
    { name: 'NoteTree' },
  )

  function init() {
    runInAction('NoteTree.init', () => {
      const { byId, selectedId, parentIds } = getCachedOr_(
        () => ({}),
        'noteTree',
      )

      tree.byId = enhanceByIdNotes(byId || createInitialNotesByIdState())
      tree.parentIds = parentIds || createInitialParentIds()
      tree.selectedId = selectedId || null

      autorun(() => {
        setCache('noteTree', toJS(tree))
      })
    })
  }

  function enhanceByIdNotes(byIdNotes) {
    return R.mapObjIndexed(enhanceNote(tree))(byIdNotes)
  }

  function deleteAll() {
    tree.byId = enhanceByIdNotes(createInitialNotesByIdState())
    tree.parentIds = createInitialParentIds()
    setSelectedId(null)
  }

  function root() {
    return tree.root
  }

  function expandAncestors(id) {
    const parent = getParent(id)
    if (parent) {
      validate('O', [parent])
      console.log(`parent.expand`, parent)
      parent.expand()
      expandAncestors(parent.id)
    }
  }

  function setSelectedId(id) {
    tree.selectedId = id
    expandAncestors(id)
  }

  function getSelectedId() {
    return tree.selectedId
  }

  function getNote(id) {
    return tree.byId[id]
  }

  function put(n) {
    tree.byId[n.id] = n
  }

  function setPid(pid, id) {
    tree.parentIds[id] = pid
  }

  function removePid(id) {
    mobx.remove(tree.parentIds, id)
  }

  function getPid(id) {
    return tree.parentIds[id]
  }

  function createNewEnhancedNote() {
    return enhanceNote(tree, createNewNote())
  }

  function cutId(id) {
    const note = getNote(id)
    const parent = getParent(id)
    removeByIndexOf(id, parent.childIds)
    removePid(id)
    return note
  }

  function insertNoteInParentAt(idx, note, parent) {
    validate('SOO', arguments)

    parent.childIds.splice(idx, 0, note.id)
    setPid(parent.id, note.id)
  }

  function moveToById(newPid, idx, id) {
    validate('SNS', arguments)

    insertNoteInParentAt(idx, cutId(id), getNote(newPid))
  }

  function insertNew() {
    const n = createNewEnhancedNote()
    put(n)
    return n
  }

  function prependNewTo(pid) {
    const note = insertNew()
    insertNoteInParentAt(0, note, getNote(pid))
    setSelectedId(note.id)
  }

  function insertAtOffsetFromSelected(offset) {
    const sid = getSelectedId() || root().firstChildId

    if (sid) {
      const nid = insertNew().id
      const pid = getPid(sid)
      setPid(pid, nid)
      setSelectedId(nid)
      insertAtOffsetOf(sid, offset, nid, getNote(pid).childIds)
    } else {
      prependNewTo(ROOT_NOTE_ID)
    }
  }

  function isParentOfIdSelectable(id) {
    const pid = getPid(id)
    return pid && pid !== ROOT_NOTE_ID
  }

  function getParent(id) {
    return getNote(getPid(id))
  }

  function moveSelectedBy(offset) {
    const sid = getSelectedId()
    if (sid) {
      const siblingIds = getParent(sid).childIds

      moveItemByClampedOffset(sid, offset, siblingIds)
    }
  }
  function nest(id) {
    const newPIdx = getIdx(id) - 1
    if (newPIdx > -1) {
      const newPid = getParent(id).childIds[newPIdx]
      // appendTo(newPid, getNote(id))
      moveToById(newPid, 0, id)
    }
  }
  function unNest(id) {
    const oldPid = getPid(id)
    const oldParent = getParent(id)
    const oldPidIdx = getIdx(oldPid)
    const newParent = getNote(getPid(oldPid))
    const newIdx = oldPidIdx + 1

    if (newParent && oldParent && newIdx >= 0) {
      const idx = getIdx(id)
      if (idx > -1) {
        oldParent.childIds.splice(idx, 1)
      }
      newParent.childIds.splice(newIdx, 0, id)
      setPid(newParent.id, id)
    }
  }
  function getIdx(id) {
    const parent = getParent(id)
    return parent ? parent.childIds.indexOf(id) : null
  }

  function selectParentOfId(id) {
    return setSelectedId(getPid(id))
  }

  init()
  return extendObservable(tree, {
    getNote,
    isParentOfIdSelectable,
    getPid,
    getIdx,
    ...wrapActions({
      addAfter: () => insertAtOffsetFromSelected(1),
      addBefore: () => insertAtOffsetFromSelected(0),
      addChild: () => prependNewTo(getSelectedId() || ROOT_NOTE_ID),
      moveSelectedBy,
      nest,
      unNest,
      deleteAll,
      setSelectedId,
      selectParentOfId,
    }),
  })
}

const nt = createNoteTree()

window.nt = nt

function renderNoteChildren(note) {
  return note.childIds.map(id => <NoteItem key={id} id={id} />)
}

const keyMapToHandler = R.pipe(
  R.map(([key, handler]) => [ev => isHotKey(key, ev), handler]),
  R.append([R.T, () => R.identity]),
  R.cond,
)

function noteTitleKeyDownHandler(note) {
  const keyMap = [
    [
      'left',
      (ev, note) => {
        if (note.canCollapse) {
          ev.preventDefault()
          note.toggleCollapse()
        } else if (note.isParentSelectable) {
          ev.preventDefault()
          note.selectParent()
        }
      },
    ],
    [
      'right',
      (ev, note) => {
        if (note.canExpand) {
          ev.preventDefault()
          note.toggleCollapse()
        }
      },
    ],
    [
      'mod+up',
      (ev, note) => {
        ev.preventDefault()
        note.moveUp()
      },
    ],
    [
      'mod+down',
      (ev, note) => {
        ev.preventDefault()
        note.moveDown()
      },
    ],
    [
      'mod+right',
      (ev, note) => {
        ev.preventDefault()
        note.nest()
      },
    ],
    [
      'mod+left',
      (ev, note) => {
        ev.preventDefault()
        note.unNest()
      },
    ],
  ]
  const handler = keyMapToHandler(keyMap)
  return ev => handler(ev, note)
}

const NoteItem = observer(({ id }) => {
  const note = nt.getNote(id)

  const titleRef = React.createRef()

  useFocusRef(titleRef, note.isSelected, [
    note.isSelected,
    note.pid,
    note.idx,
  ])

  const onHeaderClick = () => {
    note.select()
    focusRef(titleRef)
  }
  return (
    <div>
      {/*header*/}
      <div className="flex items-center" onClick={onHeaderClick}>
        <div
          className={`ph2 code us-none ${note.isLeaf ? '' : 'pointer'}`}
          onClick={note.toggleCollapse}
        >
          {note.isLeaf ? 'o' : note.isCollapsed ? '+' : '-'}
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
          onKeyDown={noteTitleKeyDownHandler(note)}
        >
          {note.title}
        </div>
      </div>
      {/*children*/}
      {note.showChildren && (
        <div className="ml3">{renderNoteChildren(note)}</div>
      )}
    </div>
  )
})

NoteItem.displayName = 'NoteItem'

const RootTree = observer(() => (
  <div className="">{renderNoteChildren(nt.root)}</div>
))

RootTree.displayName = 'RootTree'

const ButtonBar = observer(({ buttons }) => {
  const rootRef = createRef()
  return (
    <div
      ref={rootRef}
      className="mv3 nl0"
      onKeyDown={handleArrowKeyNav(rootRef)}
    >
      {buttons.map(({ title, ...op }, idx) => (
        <button
          key={title}
          className="ml0 bn bg-transparent blue"
          {...op}
          tabIndex={idx === 0 ? 0 : -1}
        >
          {title}
        </button>
      ))}
    </div>
  )
})

ButtonBar.displayName = 'ButtonBar'

const TopBar = observer(() => {
  const buttonConfigToButtons = R.pipeWith(R.call, [
    R.mapObjIndexed((onClick, title) => ({
      title,
      onClick,
    })),
    R.values,
  ])

  const buttonConfig = buttonConfigToButtons({
    add: nt.addAfter,
    'add before': nt.addBefore,
    'add child': nt.addChild,
    'delete all': nt.deleteAll,
  })
  return <ButtonBar buttons={buttonConfig} />
})

TopBar.displayName = 'TopBar'

const App = observer(() => {
  const navContainerRef = createRef()
  // useArrowKeys(navContainerRef)
  // useRestoreFocus()

  return (
    <div className="w-80 center">
      <div className="mv3 f4 ttu tracked">Tree Notes</div>
      <TopBar />
      <div
        ref={navContainerRef}
        onKeyDown={handleArrowKeyNav(navContainerRef)}
        className="mv3"
      >
        <RootTree />
      </div>
      <DevTools />
    </div>
  )
})

App.displayName = 'App'

export default App
