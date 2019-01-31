import React from 'react'
import { observer } from 'mobx-react-lite'
import * as R from 'ramda'
import * as nanoid from 'nanoid'
import * as faker from 'faker'
import { defaultEmptyTo } from './utils'

const newNoteId = () => `N__${nanoid()}`

const newNoteTitle = () => faker.name.lastName(null)

function useNotes() {
  function getCachedOr(def, key) {
    return R.defaultTo(def, JSON.parse(localStorage.getItem(key)))
  }

  function cache(key, jsonValue) {
    localStorage.setItem(key, JSON.stringify(jsonValue))
  }

  const cacheKey = 'notes'
  const [notes, setNotes] = React.useState(() => getCachedOr([], cacheKey))

  React.useEffect(() => cache(cacheKey, notes), [notes])

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
        <div className="pv1">
          {defaultEmptyTo('no title set')(note.title)}
        </div>
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
