import React from 'react'
import * as R from 'ramda'
import { cache, defaultEmptyTo, getCachedOr } from './utils'
import {
  createInitialNotesByIdState,
  createNewNote,
  ROOT_NOTE_ID,
} from './models/note'

function useCachedState(thunk, cacheKey) {
  const [state, setState] = React.useState(() =>
    getCachedOr(thunk, cacheKey),
  )

  React.useEffect(() => cache(cacheKey, state), [state])

  return [state, setState]
}

function useNotes() {
  const notesKey = 'notes'

  // removeCached(notesKey)
  const [byId, setNotes] = useCachedState(
    createInitialNotesByIdState,
    notesKey,
  )

  const [, setParentIds] = React.useState(() => {
    return R.values(byId).reduce((acc, n) => {
      n.childIds.forEach(cid => (acc[cid] = n.id))
      return acc
    }, {})
  })

  const addNewNote = React.useCallback(() => {
    const n = createNewNote()
    setNotes(R.mergeRight({ [n.id]: n }))
    const overRootChildIds = R.over(R.lensPath([ROOT_NOTE_ID, 'childIds']))
    setNotes(overRootChildIds(R.append(n.id)))
    setParentIds(R.mergeRight({ [n.id]: ROOT_NOTE_ID }))
  }, [])

  const root = byId[ROOT_NOTE_ID]

  const rootNotes = React.useMemo(
    () => root.childIds.map(id => byId[id]),
    [root.childIds],
  )

  return { rootNotes, addNewNote }
}

const NoteList = () => {
  const notes = useNotes()

  return (
    <div className="">
      <button onClick={notes.addNewNote}>Add Note</button>
      {notes.rootNotes.map(note => (
        <div key={note.id} className="pv1">
          {defaultEmptyTo('no title set')(note.title)}
        </div>
      ))}
    </div>
  )
}

const App = () => {
  return (
    <div className="w-80 center sans-serif">
      <div className="pv3 f4 ttu tracked">Tree Notes</div>
      <div className="pv3">
        <NoteList />
      </div>
    </div>
  )
}

export default App
