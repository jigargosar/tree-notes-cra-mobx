// @flow
import { ObservableMap } from 'mobx'

type NoteTreeState = {
  byId: ObservableMap<string, Note>,
  parentIds: ObservableMap<string, ?string>,
  textInputValue: string,
  _selectedId: ?string,
}

export function createNoteTreeState() {}
