import React from 'react'
import {
  DefaultButton,
  FocusTrapZone,
  FocusZone,
  TextField,
} from 'office-ui-fabric-react'
import { observer, useComputed } from 'mobx-react-lite'
import * as faker from 'faker'
import * as nanoid from 'nanoid'
import {
  autorun,
  extendObservable,
  get as mget,
  observable,
  toJS,
} from 'mobx'

import isHotKey from 'is-hotkey/src'
import * as R from 'ramda'
import validate from 'aproba'

function hotDispose(disposer) {
  if (module['hot']) {
    module['hot'].dispose(disposer)
  }
}

const ROOT_NOTE_ID = 'ROOT_NOTE_ID'
const newNoteId = () => `N__${nanoid()}`

const newNoteTitle = () => faker.name.lastName(null)

const newNoteText = () => faker.lorem.paragraphs()

function createNote({
  id = newNoteId(),
  title = newNoteTitle(),
  text = newNoteText(),
  childIds = [],
  collapsed = false,
} = {}) {
  const state = observable.object({
    id,
    title,
    text,
    childIds,
    collapsed,
  })
  return extendObservable(state, {
    get childCt() {
      return this.childIds.length
    },
    get isLeaf() {
      return this.childCt === 0
    },
    get hasChildren() {
      return this.childCt > 0
    },
    get isRoot() {
      return this.id === ROOT_NOTE_ID
    },
    get isExpanded() {
      return this.hasChildren && !this.collapsed
    },
    get isCollapsed() {
      return this.hasChildren && this.collapsed
    },
    get displayTitle() {
      return this.title
    },
    expand() {
      this.collapsed = false
    },
    collapse() {
      this.collapsed = true
    },
    insertChildIdAt(idx, childNoteId) {
      validate('NS', arguments)
      this.childIds.splice(idx, 0, childNoteId)
    },
    insertChildIdAtAndExpand(idx, childNoteId) {
      this.insertChildIdAt(idx, childNoteId)
      this.expand()
    },
    createNewNoteAt(idx) {
      const newNote = createNote()
      this.childIds.splice(idx, 0, newNote.id)
      return newNote
    },
    removeChildId(id) {
      this.childIds = R.without(id)(this.childIds)
    },
    childIdx(childId) {
      return this.childIds.indexOf(childId)
    },
    offsetChildIdx(childId, offset) {
      return this.childIdx(childId) + offset
    },
    offsetChildId(childId, offset) {
      return mget(this.childIds, this.offsetChildIdx(childId, offset))
    },
    rollChildId(childId, off) {
      const idx = this.childIdx(childId)
      const newIdx = R.mathMod(idx + off, this.childCt)

      this.childIds = R.move(idx, newIdx, this.childIds)
    },
  })
}

function createInitialState() {
  const state = observable.object({
    byId: observable.map(),
    parentIds: observable.map(),
    _selectedId: null,
  })

  const root = createNote({ id: ROOT_NOTE_ID, title: 'Root Note' })
  state.byId.set(ROOT_NOTE_ID, root)
  state.parentIds.set(ROOT_NOTE_ID, null)
  return state
}

const nt = extendObservable(createInitialState(), {
  get root() {
    return this.get(ROOT_NOTE_ID)
  },
  get selectedId() {
    if (nt._selectedId) {
      return nt._selectedId
    } else if (nt.childCountOf(ROOT_NOTE_ID) > 0) {
      return nt.childIdsOf(ROOT_NOTE_ID)[0]
    } else {
      return null
    }
  },
  get selected() {
    const selectedId = nt.selectedId
    return selectedId ? nt.get(selectedId) : null
  },
  get textInputValue() {
    const selected = nt.selected
    return selected ? selected.text : ''
  },
  onTextInputChange: ev => {
    const selected = nt.selected
    if (selected) {
      selected.text = ev.target.value
    }
  },
  childIdsOf: pid => nt.get(pid).childIds,
  siblingIdsOf: id => nt.childIdsOf(nt.pidOf(id)),
  get: id => nt.byId.get(id),
  parentOf: id => nt.byId.get(nt.pidOf(id)),
  pidOf: id => nt.parentIds.get(id),
  idxOf: id => nt.siblingIdsOf(id).indexOf(id),
  childCountOf: id => nt.childIdsOf(id).length,
  addAndSelect({ pid = ROOT_NOTE_ID, idx = 0 }) {
    const parent = nt.get(pid)
    const newNote = parent.createNewNoteAt(idx)
    const newId = newNote.id
    this.byId.set(newId, newNote)
    this.parentIds.set(newId, pid)
    this.setSelectedId(newId)
  },
  rollAndSelect: (id, off) => {
    nt.parentOf(id).rollChildId(id, off)
    nt.setSelectedId(id)
  },
  moveTo: ({ id, parent, idx }) => {
    nt.parentOf(id).removeChildId(id)
    nt.parentIds.set(id, parent.id)
    parent.insertChildIdAtAndExpand(idx, id)
  },
  nest(id) {
    const oldParent = this.parentOf(id)
    const newPid = oldParent.offsetChildId(id, -1)
    if (newPid) {
      const newParent = this.get(newPid)
      nt.moveTo({ id, parent: newParent, idx: newParent.childCt })
    }
  },
  unnest(id) {
    const pid = this.pidOf(id)
    if (pid !== ROOT_NOTE_ID) {
      const newParent = this.parentOf(pid)
      this.moveTo({ id, parent: newParent, idx: this.idxOf(pid) + 1 })
    }
  },
  onAdd: () => nt.addAndSelect({}),
  persist: () => localStorage.setItem('nt', JSON.stringify(toJS(nt))),
  hydrate: () => {
    const json = JSON.parse(localStorage.getItem('nt'))
    if (json) {
      const { byId, parentIds, _selectedId } = json
      console.log(`hydrate:`, json)
      nt.byId.replace(R.mapObjIndexed(createNote)(byId))
      nt.parentIds.replace(parentIds)
      nt._selectedId = _selectedId
    }
  },
  setSelectedId(id) {
    nt._selectedId = id
  },
  onTitleFocus: id => () => {
    nt._selectedId = id
  },
  onTitleKeyDown: id => ev => {
    const note = nt.get(id)
    const pid = nt.pidOf(id)
    const parent = nt.parentOf(id)
    if (isHotKey('mod+shift+enter', ev)) {
      ev.preventDefault()
      nt.addAndSelect({ pid: id, idx: 0 })
    } else if (isHotKey('mod+enter', ev)) {
      ev.preventDefault()
      nt.addAndSelect({ pid: pid, idx: nt.idxOf(id) + 1 })
    } else if (isHotKey('shift+enter', ev)) {
      ev.preventDefault()
      nt.addAndSelect({ pid: pid, idx: nt.idxOf(id) })
    } else if (isHotKey('left', ev)) {
      if (note.isExpanded) {
        ev.preventDefault()
        note.collapse()
      } else if (!parent.isRoot) {
        ev.preventDefault()
        nt.setSelectedId(pid)
      }
    } else if (isHotKey('right', ev)) {
      if (note.isCollapsed) {
        ev.preventDefault()
        note.expand()
      }
    } else if (isHotKey('mod+up', ev)) {
      ev.preventDefault()
      nt.rollAndSelect(id, -1)
    } else if (isHotKey('mod+down', ev)) {
      ev.preventDefault()
      nt.rollAndSelect(id, 1)
    } else if (isHotKey('mod+right', ev)) {
      ev.preventDefault()
      nt.nest(id)
    } else if (isHotKey('mod+left', ev)) {
      ev.preventDefault()
      nt.unnest(id)
    }
  },
  deleteAll: () => {
    const { byId, parentIds, _selectedId } = createInitialState()

    nt.byId.replace(byId)
    nt.parentIds.replace(parentIds)
    nt._selectedId = _selectedId
  },
})

nt.hydrate()
hotDispose(autorun(nt.persist))

const NoteItem = observer(({ id }) => {
  const note = nt.get(id)
  const isSelected = useComputed(() => nt.selectedId === id, [id])
  const onTitleKeyDown = nt.onTitleKeyDown(id)
  const onTitleFocus = nt.onTitleFocus(id)

  const titleRef = React.createRef()

  React.useEffect(() => {
    if (isSelected) {
      const el = titleRef.current
      if (el && document.activeElement !== el) {
        el.focus()
      }
    }
  }, [isSelected])

  return (
    <div>
      {/* Title */}
      <div className="flex items-center">
        <div className="ph2 code">
          {note.isCollapsed ? '+' : note.isExpanded ? '-' : 'o'}
        </div>
        <div
          ref={titleRef}
          className={`mr2 ph2 pv1 flex-auto ${
            isSelected ? 'bg-light-blue' : ''
          }`}
          data-is-focusable="true"
          onKeyDown={onTitleKeyDown}
          tabIndex={-1}
          onFocus={onTitleFocus}
        >
          {note.displayTitle}
        </div>
      </div>
      {/*  Children */}
      {note.isExpanded && (
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
    <div>
      {nt.root.childIds.map(id => (
        <NoteItem key={id} id={id} />
      ))}
    </div>
  )
})

const App = observer(() => {
  return (
    <FocusTrapZone disableFirstFocus={true}>
      <div className="w-80 center sans-serif">
        <div className="mt3 f4 ttu tracked">Tree Notes</div>
        <div className="mt3 flex items-center">
          <FocusZone isCircularNavigation={true}>
            <DefaultButton text="delete all" onClick={nt.deleteAll} />
            <DefaultButton className="ml3" text="add" onClick={nt.onAdd} />
          </FocusZone>
        </div>
        <div className="mt3">
          <div className="flex">
            <div className="w-50">
              <FocusZone isCircularNavigation={true}>
                <RootTree />
              </FocusZone>
            </div>
            <div className="w-50">
              <TextField
                multiline
                autoAdjustHeight
                resizable={false}
                disabled={!nt.selected}
                value={nt.textInputValue}
                onChange={nt.onTextInputChange}
              />
            </div>
          </div>
        </div>
      </div>
    </FocusTrapZone>
  )
})

export default App
