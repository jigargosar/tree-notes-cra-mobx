import * as nanoid from 'nanoid'
import * as faker from 'faker'

const newNoteId = () => `N__${nanoid()}`
const newNoteTitle = () => faker.name.lastName(null)

export function createNewNote() {
  return { id: newNoteId(), title: newNoteTitle(), childIds: [] }
}

export const ROOT_NOTE_ID = 'ROOT_NOTE_ID'

export function createRootNote() {
  return { id: ROOT_NOTE_ID, title: 'Root Note Title', childIds: [] }
}

export function createInitialNotesByIdState() {
  const root = createRootNote()
  return { [root.id]: root }
}

export function noteChildCt(root) {
  return root.childIds.length
}

function insertAt(start, item, arr) {
  arr.splice(start, 0, item)
}

export function appendChildId(cid, parent) {
  insertAt(noteChildCt(parent), cid, parent.childIds)
}
