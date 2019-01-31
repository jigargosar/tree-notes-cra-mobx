import React from 'react'
import { observer } from 'mobx-react-lite'
import * as R from 'ramda'
import * as nanoid from 'nanoid'
import * as faker from 'faker'
import { cache, defaultEmptyTo, getCachedOr, removeCached } from './utils'

const newNoteId = () => `N__${nanoid()}`

const newNoteTitle = () => faker.name.lastName(null)

function useCachedState(def, cacheKey) {
  const [state, setState] = React.useState(() =>
    getCachedOr(def, cacheKey),
  )

  React.useEffect(() => cache(cacheKey, state), [state])

  return [state, setState]
}

function createNewNote() {
  return { id: newNoteId(), title: newNoteTitle() }
}

function useNotes() {
  const cacheKey = 'notes'
  const [notes, setNotes] = useCachedState([], cacheKey)
  removeCached(cacheKey)

  const addNewNote = React.useCallback(
    () => setNotes(R.append(createNewNote())),
    [],
  )

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
