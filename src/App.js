import React from 'react'
import { observer } from 'mobx-react-lite'
import * as R from 'ramda'
import * as nanoid from 'nanoid'
import * as faker from 'faker'

const newNoteId = () => `N__${nanoid()}`

const newNoteTitle = () => faker.name.lastName(null)

const NoteList = observer(() => {
  const [notes, setNotes] = React.useState(() => [])
  return (
    <div className="">
      <button
        onClick={() =>
          setNotes(R.append({ id: newNoteId(), title: newNoteTitle() }))
        }
      >
        Add Note
      </button>
      {notes.map(note => (
        <div className="pv1">{note.title || 'no title'}</div>
      ))}
    </div>
  )
})

const App = observer(() => {
  return (
    <div className="w-80 center sans-serif">
      <div className="pv3 f4 ttu tracked">Tree Notes</div>
      <div className="pv3">
        <NoteList />
      </div>
    </div>
  )
})

export default App
