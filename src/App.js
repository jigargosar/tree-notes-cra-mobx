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
      />
    )
  }
}

const NoteItem = React.memo(function NoteItem({
  id,
  title,
  isSelected,
  childIds,
}) {
  const overmind = useOvermind()
  const { actions } = overmind
  const selectNote = () => actions.selectNoteId(id)
  return (
    <div>
      {/*title*/}
      <div className="pv1 ph1" tabIndex={0} onFocus={selectNote}>
        {title}
      </div>
      <div className="ml3">
        {childIds.map(renderNoteItemWithId(overmind))}
      </div>
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
