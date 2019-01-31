import React from 'react'
import { observer } from 'mobx-react-lite'
import * as R from 'ramda'
import * as nanoid from 'nanoid'
import * as faker from 'faker'

const newNoteId = () => `N__${nanoid()}`

const newNoteTitle = () => faker.name.lastName(null)

function getCachedNotes() {
  return R.defaultTo([], JSON.parse(localStorage.getItem('notes')))
}

function cacheNotes(notes) {
  localStorage.setItem('notes', JSON.stringify(notes))
}

function useNotes() {
  const [notes, setNotes] = React.useState(getCachedNotes)

  React.useEffect(() => cacheNotes(notes), [notes])

  const addNewNote = () =>
    setNotes(R.append({ id: newNoteId(), title: newNoteTitle() }))
  return { rootNotes: notes, addNewNote }
}

const NoteList = observer(() => {
  const notes = useNotes()

  return (
    <div className="">
      <button onClick={notes.addNewNote}>Add Note</button>
      {notes.rootNotes.map(note => (
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
