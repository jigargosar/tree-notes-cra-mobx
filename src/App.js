import React from 'react'
import {
  DefaultButton,
  FocusTrapZone,
  FocusZone,
  TextField,
} from 'office-ui-fabric-react'
import { observer } from 'mobx-react-lite'
import * as faker from 'faker'
import * as nanoid from 'nanoid'
import { autorun, extendObservable, observable, toJS } from 'mobx'
import isHotKey from 'is-hotkey/src'
import * as R from 'ramda'

const ROOT_NOTE_ID = 'ROOT_NOTE_ID'

const newNoteId = () => `N__${nanoid()}`

const newNoteTitle = () => faker.name.lastName(null)
const newNoteText = () => faker.lorem.paragraphs()

function focusDomId(domId) {
  console.log(`Will focus domId`, domId)
  requestAnimationFrame(() => {
    const el = document.getElementById(domId)
    if (el) {
      el.focus()
    } else {
      console.error(`Focus: domId=${domId} not found`)
    }
  })
}

function getNoteTitleDomId(note) {
  return `note-title--${note.id}`
}

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
    get titleDomId() {
      return getNoteTitleDomId(this)
    },
    focusTitle() {
      focusDomId(this.titleDomId)
    },
    expand() {
      this.collapsed = false
    },
    collapse() {
      this.collapsed = true
    },
    insertChildIdAt(idx, newId) {
      this.childIds.splice(idx, 0, newId)
    },
    createNewNoteAt(idx) {
      const newNote = createNote()
      this.childIds.splice(idx, 0, newNote.id)
      return newNote
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
  get rootNote() {
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
  siblingCountOf: id => nt.siblingIdsOf(id).length,
  addAndFocus({ pid = ROOT_NOTE_ID, idx = 0 }) {
    const parent = nt.get(pid)
    const newNote = parent.createNewNoteAt(idx)
    const newId = newNote.id
    this.byId.set(newId, newNote)
    this.parentIds.set(newId, pid)
    newNote.focusTitle()
  },
  rollAndFocus: (id, off) => {
    const idx = nt.idxOf(id)
    const newIdx = R.mathMod(idx + off, nt.siblingCountOf(id))

    nt.parentOf(id).childIds = R.move(idx, newIdx, nt.siblingIdsOf(id))
    nt.focus(id)
  },
  moveAndFocus: ({ id, pid, idx }) => {
    const oldIdx = nt.idxOf(id)
    const oldPid = nt.pidOf(id)
    nt.childIdsOf(oldPid).splice(oldIdx, 1)
    nt.parentIds.set(id, pid)
    nt.childIdsOf(pid).splice(idx, 0, id)
    nt.focus(id)
  },
  nestAndFocus(id) {
    const idx = nt.idxOf(id)
    if (idx > 0) {
      const newPid = nt.siblingIdsOf(id)[idx - 1]
      nt.moveAndFocus({ id, pid: newPid, idx: nt.childCountOf(newPid) })
    }
  },
  unnestAndFocus(id) {
    const pid = nt.pidOf(id)
    if (pid !== ROOT_NOTE_ID) {
      nt.moveAndFocus({ id, pid: nt.pidOf(pid), idx: nt.idxOf(pid) + 1 })
    }
  },
  onAdd: () => nt.addAndFocus({}),
  displayTitle: id => nt.get(id).title,
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
  initFocus: () => {
    nt.selected && nt.selected.focusTitle()
  },
  focus(id) {
    nt.get(id).focusTitle()
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
      nt.addAndFocus({ pid: id, idx: 0 })
    } else if (isHotKey('mod+enter', ev)) {
      ev.preventDefault()
      nt.addAndFocus({ pid: pid, idx: nt.idxOf(id) + 1 })
    } else if (isHotKey('shift+enter', ev)) {
      ev.preventDefault()
      nt.addAndFocus({ pid: pid, idx: nt.idxOf(id) })
    } else if (isHotKey('left', ev)) {
      if (note.isExpanded) {
        ev.preventDefault()
        note.collapse()
      } else if (!parent.isRoot) {
        ev.preventDefault()
        parent.focusTitle()
      }
    } else if (isHotKey('right', ev)) {
      if (note.isCollapsed) {
        ev.preventDefault()
        note.expand()
      }
    } else if (isHotKey('mod+up', ev)) {
      ev.preventDefault()
      nt.rollAndFocus(id, -1)
    } else if (isHotKey('mod+down', ev)) {
      ev.preventDefault()
      nt.rollAndFocus(id, 1)
    } else if (isHotKey('mod+right', ev)) {
      ev.preventDefault()
      nt.nestAndFocus(id)
    } else if (isHotKey('mod+left', ev)) {
      ev.preventDefault()
      nt.unnestAndFocus(id)
    }
  },
  deleteAll: () => {
    const { byId, parentIds, _selectedId } = createInitialState()

    nt.byId.replace(byId)
    nt.parentIds.replace(parentIds)
    nt._selectedId = _selectedId
  },
})

window.nt = nt

nt.hydrate()

function hotDispose(disposer) {
  if (module.hot) {
    module.hot.dispose(disposer)
  }
}

hotDispose(autorun(nt.persist))

const NoteItem = observer(({ id }) => {
  const note = nt.get(id)
  const isSelected = nt.selectedId === id
  const onTitleKeyDown = nt.onTitleKeyDown(id)
  const onTitleFocus = nt.onTitleFocus(id)

  return (
    <div>
      {/* Title */}
      <div className="flex items-center">
        <div className="ph2 code">
          {note.isCollapsed ? '+' : note.isExpanded ? '-' : 'o'}
        </div>
        <div
          id={getNoteTitleDomId(note)}
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
      {nt.rootNote.childIds.map(id => (
        <NoteItem key={id} id={id} />
      ))}
    </div>
  )
})

const App = observer(() => {
  React.useEffect(() => {
    nt.initFocus()
  }, [])

  return (
    <FocusTrapZone>
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
                // label="Non-resizable"
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
