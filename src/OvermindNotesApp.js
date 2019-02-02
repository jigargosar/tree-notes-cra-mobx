import React from 'react'
import { useOvermindNotes } from './overmind-notes-hook'

function App() {
  const { state, actions } = useOvermindNotes()
  return (
    <div className="w-80 center sans-serif">
      <div className="pv3 f4 ttu tracked">Tree Notes</div>
      <div className="pv3">
        <button onClick={actions.onAddNewNote}>add</button>
      </div>
      <div className="pv3">
        {state.rootChildren.map(n => (
          <div key={n.id} className="pv1 ph1">
            {n.title}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
