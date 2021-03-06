import React, { useEffect, useMemo, useState } from 'react'
import { useOvermind } from './overmind'
import * as R from 'ramda'
import isHotKey from 'is-hotkey'
import {
  createNewNote,
  createRootNote,
  noteListToPidLookup,
  ROOT_NOTE_ID,
} from './models/note'
import { useLocalStorage } from 'react-use'
import { appendChildId, toIdLookup } from './ramda-helpers'
import { useObject } from './hooks'

function renderNoteItemWithId(overmind) {
  const { state } = overmind
  return id => {
    const note = state.byId[id]
    return (
      <NoteItem
        key={id}
        id={id}
        title={note.title}
        isSelected={state.selectedId === id}
        childIds={note.childIds}
        isCollapsed={note.collapsed}
      />
    )
  }
}

const NoteItem = React.memo(function NoteItem({
  id,
  title,
  isSelected,
  childIds,
  isCollapsed,
}) {
  const overmind = useOvermind()
  const { actions } = overmind
  const selectNote = () => actions.setSelectedNoteId(id)
  const isLeaf = childIds.length === 0
  const showChildren = !(isLeaf || isCollapsed)

  const toggleCollapse = () => actions.toggleCollapsed(id)

  const titleRef = React.createRef()

  React.useLayoutEffect(() => {
    const el = titleRef.current
    if (el && isSelected) {
      el.focus()
    }
  })

  return (
    <div>
      {/*header*/}
      <div className="flex items-center" onClick={selectNote}>
        <div
          className={`ph2 code us-none ${isLeaf ? '' : 'pointer'}`}
          onClick={toggleCollapse}
        >
          {isLeaf ? 'o' : isCollapsed ? '+' : '-'}
        </div>
        {/*title*/}
        <div
          ref={titleRef}
          className={`flex-auto pv1 ph1 ${
            isSelected ? 'bg-light-blue' : ''
          }`}
          tabIndex={0}
          data-is-focusable={true}
          onFocus={selectNote}
        >
          {title}
        </div>
      </div>
      {/*children*/}
      {showChildren && (
        <div className="ml3">
          {childIds.map(renderNoteItemWithId(overmind))}
        </div>
      )}
    </div>
  )
})

const handleRootTreeKeyDown = (overmind, ref) => ev => {
  if (ev.defaultPrevented) {
    return
  }

  const targetIsFocusable = ev.target.dataset.isFocusable

  if (targetIsFocusable) {
    const focusables = Array.from(
      ref.current.querySelectorAll('[data-is-focusable=true]').values(),
    )

    const idx = focusables.indexOf(ev.target)
    if (isHotKey(['up', 'left'])(ev)) {
      const newIdx = R.mathMod(idx - 1)(focusables.length)
      focusables[newIdx].focus()
      ev.preventDefault()
    } else if (isHotKey(['down', 'right'])(ev)) {
      const newIdx = R.mathMod(idx + 1)(focusables.length)
      focusables[newIdx].focus()
      ev.preventDefault()
    }
  }
}

function RootTree() {
  const overmind = useOvermind()
  const ref = React.createRef()
  const root = overmind.state.root
  return (
    <div ref={ref} onKeyDown={handleRootTreeKeyDown(overmind, ref)}>
      {root.childIds.map(renderNoteItemWithId(overmind))}
    </div>
  )
}

function renderNoteItemWithId2(id, nt) {
  const note = nt.get(id)
  const isLeaf = note.childIds.length === 0
  const showChildren = !(isLeaf || note.collapsed)
  return (
    <NoteItem2
      key={id}
      id={id}
      title={note.title}
      isSelected={nt.selectedId === id}
      childIds={note.childIds}
      isCollapsed={note.collapsed}
      setSelectedNoteId={nt.setSelectedNoteId}
      toggleCollapsed={nt.toggleCollapsed}
    >
      {showChildren && (
        <div className="ml3">
          {note.childIds.map(id => renderNoteItemWithId2(id, nt))}
        </div>
      )}
    </NoteItem2>
  )
}

const NoteItem2 = React.memo(function NoteItem({
  id,
  title,
  isSelected,
  childIds,
  isCollapsed,
  setSelectedNoteId,
  toggleCollapsed,
  children,
}) {
  const selectNote = () => setSelectedNoteId(id)
  const isLeaf = childIds.length === 0

  const toggleCollapse = () => toggleCollapsed(id)

  const titleRef = React.createRef()

  React.useLayoutEffect(() => {
    const el = titleRef.current
    if (el && isSelected) {
      el.focus()
    }
  })

  return (
    <div>
      {/*header*/}
      <div className="flex items-center" onClick={selectNote}>
        <div
          className={`ph2 code us-none ${isLeaf ? '' : 'pointer'}`}
          onClick={toggleCollapse}
        >
          {isLeaf ? 'o' : isCollapsed ? '+' : '-'}
        </div>
        {/*title*/}
        <div
          ref={titleRef}
          className={`flex-auto pv1 ph1 ${
            isSelected ? 'bg-light-blue' : ''
          }`}
          tabIndex={0}
          data-is-focusable={true}
          onFocus={selectNote}
        >
          {title}
        </div>
      </div>
      {/*children*/}
      {children}
    </div>
  )
})

function useNoteTree() {
  const [cachedNoteList, saveNoteList] = useLocalStorage('notes', [
    createRootNote(),
  ])
  const [cachedSelectedId, saveSelectedId] = useLocalStorage(
    'selectedId',
    null,
  )
  const notes = useObject(() => toIdLookup(cachedNoteList))
  const parentIds = useObject(() => noteListToPidLookup(cachedNoteList))
  const [selectedId, setSelectedNoteId] = useState(() => cachedSelectedId)

  const root = notes.get(ROOT_NOTE_ID)

  const addNewTo = pid => {
    const n = createNewNote()
    notes.set(n.id, n)
    notes.over(pid, appendChildId(n.id))
    parentIds.set(n.id, pid)
    setSelectedNoteId(n.id)
  }
  const addNew = () => addNewTo(ROOT_NOTE_ID)
  const appendChildToSelected = () => {
    addNewTo(selectedId || ROOT_NOTE_ID)
  }

  const toggleCollapsed = useMemo(() => {
    return id => notes.over(id, R.over(R.lensProp('collapsed'), R.not))
  }, [notes.state])

  useEffect(() => saveNoteList(notes.values()), [notes.state])

  useEffect(() => {
    saveSelectedId(selectedId)
  }, [selectedId])

  return {
    root,
    addNew,
    appendChildToSelected,
    get: notes.get,
    setSelectedNoteId,
    toggleCollapsed,
    selectedId,
  }
}

function App() {
  const { actions } = useOvermind()

  const nt = useNoteTree()
  return (
    <div className="w-80 center sans-serif">
      <div className="pv3 f4 ttu tracked">Use Tree Notes</div>
      <button className="" onClick={nt.addNew}>
        add
      </button>
      <button className="" onClick={nt.appendChildToSelected}>
        add child
      </button>
      <div className="pv3">
        {nt.root.childIds.map(id => renderNoteItemWithId2(id, nt))}
      </div>
      <div className="pv3 f4 ttu tracked">Tree Notes</div>
      <div className="pv1">
        <button className="" onClick={actions.addNewNote}>
          add
        </button>
        <button className="ml3" onClick={actions.deleteAll}>
          delete all
        </button>
      </div>
      <div className="pv3">
        <RootTree />
      </div>
    </div>
  )
}

export default App
