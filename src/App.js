import React from 'react'
import { useOvermind } from './overmind'

function NoteItem({ note }) {
  return <div className="pv1 ph1">{note.title}</div>
}

function App() {
  const { state, actions } = useOvermind()

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
        {state.rootChildren.map(note => (
          <NoteItem key={note.id} note={note} />
        ))}
      </div>
    </div>
  )
}

export default App
