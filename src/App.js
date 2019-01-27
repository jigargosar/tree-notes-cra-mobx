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
import { autorun, observable, toJS } from 'mobx'
import isHotkey from 'is-hotkey/src'
import * as R from 'ramda'

const ROOT_NOTE_ID = 'ROOT_NOTE_ID'

const newNoteId = () => `N__${nanoid()}`

const newNoteTitle = () => faker.name.lastName(null)

const createNewNote = () => ({
  id: newNoteId(),
  title: newNoteTitle(),
  childIds: [],
  collapsed: false,
})

const initialRootNote = {
  ...createNewNote(),
  id: ROOT_NOTE_ID,
  title: 'Root Note',
}

const createInitialState = () => ({
  byId: observable.map({ ROOT_NOTE_ID: initialRootNote }),
  parentIds: observable.map({ ROOT_NOTE_ID: null }),
})

const nt = observable({
  ...createInitialState(),
  childIdsOf: pid => nt.get(pid).childIds,
  siblingIdsOf: id => nt.childIdsOf(nt.pidOf(id)),
  get: id => nt.byId.get(id),
  parentOf: id => nt.byId.get(nt.pidOf(id)),
  pidOf: id => nt.parentIds.get(id),
  idxOf: id => nt.siblingIdsOf(id).indexOf(id),
  childCountOf: id => nt.childIdsOf(id).length,
  siblingCountOf: id => nt.siblingIdsOf(id).length,
  isExpanded: id => nt.childCountOf(id) > 0 && !nt.get(id).collapsed,
  isCollapsed: id => nt.childCountOf(id) > 0 && nt.get(id).collapsed,
  addAndFocus({ pid = ROOT_NOTE_ID, idx = 0 }) {
    const newNote = createNewNote()
    const newId = newNote.id
    nt.byId.set(newId, newNote)
    nt.parentIds.set(newId, pid)
    nt.childIdsOf(pid).splice(idx, 0, newId)
    nt.focus(newId)
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
  collapse: id => (nt.get(id).collapsed = true),
  expand: id => (nt.get(id).collapsed = false),
  onAdd: () => nt.addAndFocus({}),
  displayTitle: id => nt.get(id).title,
  persist: () => localStorage.setItem('nt', JSON.stringify(toJS(nt))),
  hydrate: () => {
    const json = JSON.parse(localStorage.getItem('nt'))
    if (json) {
      console.log(`hydrate:`, json)
      nt.byId.replace(json.byId)
      nt.parentIds.replace(json.parentIds)
    }
  },
  titleDomIdOf: id => `note-title--${id}`,
  focus(id) {
    const domId = nt.titleDomIdOf(id)
    console.log(`Will focus domId`, domId)
    requestAnimationFrame(() => {
      const el = document.getElementById(domId)
      if (el) {
        el.focus()
      } else {
        console.error(`Focus: domId=${domId} not found`)
      }
    })
  },
  onTitleKeyDown: id => ev => {
    const pid = nt.pidOf(id)
    if (isHotkey('mod+shift+enter', ev)) {
      ev.preventDefault()
      nt.addAndFocus({ pid: id, idx: 0 })
    } else if (isHotkey('enter', ev)) {
      ev.preventDefault()
      nt.addAndFocus({ pid: pid, idx: nt.idxOf(id) + 1 })
    } else if (isHotkey('shift+enter', ev)) {
      ev.preventDefault()
      nt.addAndFocus({ pid: pid, idx: nt.idxOf(id) })
    } else if (isHotkey('left', ev)) {
      if (nt.isExpanded(id)) {
        nt.collapse(id)
        ev.preventDefault()
      } else if (pid !== ROOT_NOTE_ID) {
        nt.focus(pid)
        ev.preventDefault()
      }
    } else if (isHotkey('right', ev)) {
      if (nt.isCollapsed(id)) {
        ev.preventDefault()
        nt.expand(id)
      }
    } else if (isHotkey('mod+up', ev)) {
      ev.preventDefault()
      nt.rollAndFocus(id, -1)
    } else if (isHotkey('mod+down', ev)) {
      ev.preventDefault()
      nt.rollAndFocus(id, 1)
    } else if (isHotkey('mod+right', ev)) {
      ev.preventDefault()
      nt.nestAndFocus(id)
    } else if (isHotkey('mod+left', ev)) {
      ev.preventDefault()
      nt.unnestAndFocus(id)
    }
  },
  deleteAll: () => {
    const { byId, parentIds } = createInitialState()
    nt.byId.replace(byId)
    nt.parentIds.replace(parentIds)
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
  return (
    <div>
      {/* Title */}
      <div className="flex items-center">
        <div className="ph2 code">
          {nt.isCollapsed(id) ? '+' : nt.isExpanded(id) ? '-' : 'o'}
        </div>
        <div
          id={nt.titleDomIdOf(id)}
          className="ph2 pv1 flex-auto"
          data-is-focusable="true"
          onKeyDown={nt.onTitleKeyDown(id)}
          tabIndex={-1}
        >
          {nt.displayTitle(id)}
        </div>
      </div>
      {/*  Children */}
      {nt.isExpanded(id) && (
        <div className="ml3">
          {nt.childIdsOf(id).map(id => (
            <NoteItem key={id} id={id} nt={nt} />
          ))}
        </div>
      )}
    </div>
  )
})

const RootTree = observer(() => (
  <div>
    {nt.childIdsOf(ROOT_NOTE_ID).map(id => (
      <NoteItem key={id} id={id} />
    ))}
  </div>
))

const App = observer(() => (
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
            />
          </div>
        </div>
      </div>
    </div>
  </FocusTrapZone>
))

export default App
