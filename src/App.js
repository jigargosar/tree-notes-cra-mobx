import React from 'react'
import { DefaultButton, FocusZone } from 'office-ui-fabric-react'
import { observer } from 'mobx-react-lite'
import * as faker from 'faker'
import * as nanoid from 'nanoid'
import { autorun, observable, toJS } from 'mobx'
import isHotkey from 'is-hotkey/src'

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

const initialState = {
  byId: observable.map({ ROOT_NOTE_ID: initialRootNote }),
  parentIds: observable.map({ ROOT_NOTE_ID: null }),
}

const nt = observable({
  ...initialState,
  childIdsOf: pid => nt.get(pid).childIds,
  get: id => nt.byId.get(id),
  pidOf: id => nt.parentIds.get(id),
  idxOf: id => nt.childIdsOf(nt.pidOf(id)).indexOf(id),
  childCount: id => nt.childIdsOf(id).length,
  isExpanded: id => nt.childCount(id) > 0 && !nt.get(id).collapsed,
  isCollapsed: id => nt.childCount(id) > 0 && nt.get(id).collapsed,
  add({ pid = ROOT_NOTE_ID, idx = 0 }) {
    const newNote = createNewNote()
    const newId = newNote.id
    nt.byId.set(newId, newNote)
    nt.parentIds.set(newId, pid)
    nt.childIdsOf(pid).splice(idx, 0, newId)
  },
  collapse: id => (nt.get(id).collapsed = true),
  expand: id => (nt.get(id).collapsed = false),
  onAdd: () => nt.add({}),
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
  onTitleKeyDown: id => ev => {
    if (isHotkey('mod+shift+enter', ev)) {
      nt.add({ pid: id, idx: 0 })
    }
    if (isHotkey('enter', ev)) {
      nt.add({ pid: nt.pidOf(id), idx: nt.idxOf(id) + 1 })
    }
    if (isHotkey('shift+enter', ev)) {
      nt.add({ pid: nt.pidOf(id), idx: nt.idxOf(id) })
    }
    if (isHotkey('left', ev)) {
      if (nt.isExpanded(id)) {
        nt.collapse(id)
        ev.preventDefault()
      }
    }
    if (isHotkey('right', ev)) {
      if (nt.isCollapsed(id)) {
        nt.expand(id)
        ev.preventDefault()
      }
    }
  },
  deleteAll: () => {
    nt.byId.replace(initialState.byId)
    nt.parentIds.replace(initialState.parentIds)
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
      <div className="mt2 flex items-center">
        <div className="ph2">o</div>
        <div
          className="ph2 pv1 flex-auto"
          data-is-focusable="true"
          onKeyDown={nt.onTitleKeyDown(id)}
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

const App = observer(function AppInner() {
  return (
    <FocusZone isCircularNavigation={true}>
      <div className="w-80 center sans-serif">
        <div className="mt3 f4 ttu tracked">Tree Notes</div>
        <div className="mt3 flex items-center">
          <DefaultButton text="delete all" onClick={nt.deleteAll} />
          <DefaultButton className="ml3" text="add" onClick={nt.onAdd} />
        </div>
        <div className="mt3">
          {nt.childIdsOf(ROOT_NOTE_ID).map(id => (
            <NoteItem key={id} id={id} />
          ))}
        </div>
      </div>
    </FocusZone>
  )
})

export default App
