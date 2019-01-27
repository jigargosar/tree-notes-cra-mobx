// @flow

import * as nanoid from 'nanoid'
import * as faker from 'faker'
import { observable, ObservableMap } from 'mobx'

const ROOT_NOTE_ID = 'ROOT_NOTE_ID'

const newNoteId = () => `N__${nanoid()}`

const newNoteTitle = () => faker.name.lastName(null)
const newNoteText = () => faker.lorem.paragraphs()

type Note = {
  id: string,
  title: string,
  text: string,
  childIds: string[],
  collapsed: boolean,
}

export const createNewNote = () => ({
  id: newNoteId(),
  title: newNoteTitle(),
  text: newNoteText(),
  childIds: [],
  collapsed: false,
})

type NoteTree = {
  byId: ObservableMap<string, Note>,
  parentIds: ObservableMap<string, ?string>,
  textInputValue: string,
  _selectedId: ?string,
}

export function createInitialState(): NoteTree {
  const initialRootNote: Note = {
    ...createNewNote(),
    id: ROOT_NOTE_ID,
    title: 'Root Note',
  }

  const byId: ObservableMap<string, Note> = observable.map({
    ROOT_NOTE_ID: initialRootNote,
  })
  const parentIds: ObservableMap<string, ?string> = observable.map({
    ROOT_NOTE_ID: null,
  })
  return {
    byId,
    parentIds,
    textInputValue: '',
    _selectedId: null,
  }
}
