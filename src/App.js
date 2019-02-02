import React from 'react'
import { useOvermind } from './overmind'

const NoteItem = React.memo(({ id, title, isSelected }) => {
  const { actions } = useOvermind()
  const selectNote = () => actions.selectNoteId(id)
  return (
    <div className="pv1 ph1" tabIndex={0} onFocus={selectNote}>
      {title}
    </div>
  )
})

function renderNoteItemWithId(overmind) {
  const { state } = overmind
  return id => (
    <NoteItem
      key={id}
      id={id}
      title={state.byId[id].title}
      isSelected={state.selectedId === id}
    />
  )
}

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
