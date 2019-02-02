import React from 'react'
import { useOvermind } from './overmind'

const NoteItem = React.memo(({ note, isSelected, selectNoteId }) => {
  const selectNote = React.useCallback(() => {
    return selectNoteId(note.id)
  })

  return (
    <div className="pv1 ph1" tabIndex={0} onFocus={selectNote}>
      {note.title}
    </div>
  )
})

function RootTree() {
  const { state, actions } = useOvermind()
  return (
    <div>
      {state.root.childIds.map(id => (
        <NoteItem
          key={id}
          id={id}
          note={state.byId[id]}
          isSelected={state.selectedId === id}
          selectNoteId={actions.selectNoteId}
        />
      ))}
    </div>
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
