import * as nanoid from 'nanoid'
import * as faker from 'faker'

const newNoteId = () => `N__${nanoid()}`
const newNoteTitle = () => faker.name.lastName(null)

export function createNewNote() {
  return {
    id: newNoteId(),
    title: newNoteTitle(),
    childIds: [],
    collapsed: false,
  }
}

export const ROOT_NOTE_ID = 'ROOT_NOTE_ID'

export function createRootNote() {
  return {
    id: ROOT_NOTE_ID,
    title: 'Root Note Title',
    childIds: [],
    collapsed: false,
  }
}

export function createInitialNotesByIdState() {
  const root = createRootNote()
  return { [root.id]: root }
}

export function noteChildCt(note) {
  return note.childIds.length
}

function insertAt_(start, item, arr) {
  arr.splice(start, 0, item)
}

export function appendChildId_(cid, parent) {
  insertAt_(noteChildCt(parent), cid, parent.childIds)
}

export function noteListToPidLookup(cachedNL) {
  const parentIdLookup = {}
  cachedNL.forEach(n => {
    n.childIds.forEach(cid => {
      parentIdLookup[cid] = n.id
    })
  })
  return parentIdLookup
}
