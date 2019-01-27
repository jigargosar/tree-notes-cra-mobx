// @flow

import * as nanoid from 'nanoid'
import * as faker from 'faker'
import { extendObservable, observable, ObservableMap, toJS } from 'mobx'
import * as R from 'ramda'
import isHotKey from 'is-hotkey'

export const ROOT_NOTE_ID = 'ROOT_NOTE_ID'

const newNoteId = () => `N__${nanoid()}`

const newNoteTitle = () => faker.name.lastName(null)
const newNoteText = () => faker.lorem.paragraphs()

type Note = {
  id: string,
  title: string,
  text: string,
  childIds: string[],
  collapsed: boolean,
}

export const createNewNote = () => ({
  id: newNoteId(),
  title: newNoteTitle(),
  text: newNoteText(),
  childIds: [],
  collapsed: false,
})

type NoteTreeState = {
  byId: ObservableMap<string, Note>,
  parentIds: ObservableMap<string, ?string>,
  textInputValue: string,
  _selectedId: ?string,
}

export function createInitialNoteTreeState(): NoteTreeState {
  const initialRootNote: Note = {
    ...createNewNote(),
    id: ROOT_NOTE_ID,
    title: 'Root Note',
  }

  const byId: ObservableMap<string, Note> = observable.map({
    ROOT_NOTE_ID: initialRootNote,
  })
  const parentIds: ObservableMap<string, ?string> = observable.map({
    ROOT_NOTE_ID: null,
  })
  return {
    byId,
    parentIds,
    textInputValue: '',
    _selectedId: null,
  }
}

const nt = extendObservable(createInitialNoteTreeState(), {
  get selectedId() {
    if (this._selectedId) {
      return this._selectedId
    } else if (this.childCountOf(ROOT_NOTE_ID) > 0) {
      return this.childIdsOf(ROOT_NOTE_ID)[0]
    } else {
      return null
    }
  },
  getSelectedId() {
    if (this._selectedId) {
      return this._selectedId
    } else if (this.childCountOf(ROOT_NOTE_ID) > 0) {
      return this.childIdsOf(ROOT_NOTE_ID)[0]
    } else {
      return null
    }
  },
  getSelected() {
    const selectedId = this.getSelectedId()
    return selectedId ? this.get(selectedId) : null
  },
  getTextInputValue: function() {
    const selected = this.getSelected()
    return selected ? selected.text : null
  },
  onTextInputChange: function(ev) {
    const selected = this.getSelected()
    if (selected) {
      selected.text = ev.target.value
    }
  },
  childIdsOf(pid) {
    return this.get(pid).childIds
  },
  siblingIdsOf(id) {
    return this.childIdsOf(this.pidOf(id))
  },
  get(id) {
    return id ? this.byId.get(id) : null
  },
  parentOf(id) {
    return this.byId.get(this.pidOf(id))
  },
  pidOf: function(id) {
    return this.parentIds.get(id)
  },
  idxOf(id) {
    return this.siblingIdsOf(id).indexOf(id)
  },
  childCountOf(id) {
    return this.childIdsOf(id).length
  },
  siblingCountOf(id) {
    return this.siblingIdsOf(id).length
  },
  isExpanded(id) {
    return this.childCountOf(id) > 0 && !this.get(id).collapsed
  },
  isCollapsed(id) {
    return this.childCountOf(id) > 0 && this.get(id).collapsed
  },
  addAndFocus({ pid = ROOT_NOTE_ID, idx = 0 }) {
    const newNote = createNewNote()
    const newId = newNote.id
    this.byId.set(newId, newNote)
    this.parentIds.set(newId, pid)
    this.childIdsOf(pid).splice(idx, 0, newId)
    this.focus(newId)
  },
  rollAndFocus(id, off) {
    const idx = this.idxOf(id)
    const newIdx = R.mathMod(idx + off, this.siblingCountOf(id))

    this.parentOf(id).childIds = R.move(idx, newIdx, this.siblingIdsOf(id))
    this.focus(id)
  },
  moveAndFocus({ id, pid, idx }) {
    const oldIdx = this.idxOf(id)
    const oldPid = this.pidOf(id)
    this.childIdsOf(oldPid).splice(oldIdx, 1)
    this.parentIds.set(id, pid)
    this.childIdsOf(pid).splice(idx, 0, id)
    this.focus(id)
  },
  nestAndFocus(id) {
    const idx = this.idxOf(id)
    if (idx > 0) {
      const newPid = this.siblingIdsOf(id)[idx - 1]
      this.moveAndFocus({
        id,
        pid: newPid,
        idx: this.childCountOf(newPid),
      })
    }
  },
  unnestAndFocus(id) {
    const pid = this.pidOf(id)
    if (pid !== ROOT_NOTE_ID) {
      this.moveAndFocus({
        id,
        pid: this.pidOf(pid),
        idx: this.idxOf(pid) + 1,
      })
    }
  },
  collapse(id) {
    return (this.get(id).collapsed = true)
  },
  expand(id) {
    return (this.get(id).collapsed = false)
  },
  onAdd() {
    return this.addAndFocus({})
  },
  displayTitle(id) {
    return this.get(id).title
  },
  persist() {
    return localStorage.setItem('nt', JSON.stringify(toJS(nt)))
  },
  hydrate() {
    const json = JSON.parse(localStorage.getItem('nt') || '')
    if (json) {
      const { byId, parentIds, textInputValue, _selectedId } = json
      console.log(`hydrate:`, json)
      this.byId.replace(byId)
      this.parentIds.replace(parentIds)
      this.textInputValue = textInputValue
      this._selectedId = _selectedId
    }
  },
  titleDomIdOf(id) {
    return `note-title--${id}`
  },
  initFocus() {
    const selectedId = this.getSelectedId()
    if (selectedId) {
      this.focus(selectedId)
    }
  },
  focus(id) {
    const domId = this.titleDomIdOf(id)
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
  onTitleFocus(id) {
    return () => {
      this._selectedId = id
    }
  },
  onTitleKeyDown(id) {
    return ev => {
      const pid = this.pidOf(id)
      if (isHotKey('mod+shift+enter', ev)) {
        ev.preventDefault()
        this.addAndFocus({ pid: id, idx: 0 })
      } else if (isHotKey('mod+enter', ev)) {
        ev.preventDefault()
        this.addAndFocus({ pid: pid, idx: this.idxOf(id) + 1 })
      } else if (isHotKey('shift+enter', ev)) {
        ev.preventDefault()
        this.addAndFocus({ pid: pid, idx: this.idxOf(id) })
      } else if (isHotKey('left', ev)) {
        if (this.isExpanded(id)) {
          this.collapse(id)
          ev.preventDefault()
        } else if (pid !== ROOT_NOTE_ID) {
          this.focus(pid)
          ev.preventDefault()
        }
      } else if (isHotKey('right', ev)) {
        if (this.isCollapsed(id)) {
          ev.preventDefault()
          this.expand(id)
        }
      } else if (isHotKey('mod+up', ev)) {
        ev.preventDefault()
        this.rollAndFocus(id, -1)
      } else if (isHotKey('mod+down', ev)) {
        ev.preventDefault()
        this.rollAndFocus(id, 1)
      } else if (isHotKey('mod+right', ev)) {
        ev.preventDefault()
        this.nestAndFocus(id)
      } else if (isHotKey('mod+left', ev)) {
        ev.preventDefault()
        this.unnestAndFocus(id)
      }
    }
  },
  deleteAll() {
    const {
      byId,
      parentIds,
      textInputValue,
      _selectedId,
    } = createInitialNoteTreeState()

    this.byId.replace(byId)
    this.parentIds.replace(parentIds)
    this.textInputValue = textInputValue
    this._selectedId = _selectedId
  },
})
