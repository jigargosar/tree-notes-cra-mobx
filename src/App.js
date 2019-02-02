import React from 'react'
import { useOvermind } from './overmind'

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
  const selectNote = () => actions.selectNoteId(id)
  const toggleCollapse = () => actions.toggleCollapsed(id)
  return (
    <div>
      {/*header*/}
      <div className="flex items-center">
        <div className="ph2 code us-none" onClick={toggleCollapse}>
          {childIds.length < 1 ? 'o' : isCollapsed ? '+' : '-'}
        </div>
        {/*title*/}
        <div
          className={`flex-auto pv1 ph1 ${
            isSelected ? 'bg-light-blue' : ''
          }`}
          tabIndex={0}
          onFocus={selectNote}
        >
          {title}
        </div>
      </div>
      {/*children*/}
      {childIds.length > 0 && (
        <div className="ml3">
          {childIds.map(renderNoteItemWithId(overmind))}
        </div>
      )}
    </div>
  )
})

function RootTree() {
  const overmind = useOvermind()
  const { state } = overmind
  return (
    <div>{state.root.childIds.map(renderNoteItemWithId(overmind))}</div>
  )
}

function App() {
  const { actions } = useOvermind()

  return (
    <div className="w-80 center sans-serif">
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
