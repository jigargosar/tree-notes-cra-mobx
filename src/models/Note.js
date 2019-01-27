// @flow
import { observable, ObservableMap } from 'mobx'

type NoteState = {
  id: string,
  title: string,
  text: string,
  childIds: string[],
  collapsed: boolean,
}

type NoteTreeState = {
  byId: ObservableMap<string, NoteState>,
  parentIds: ObservableMap<string, ?string>,
}

export function createNoteTreeState(): NoteTreeState {
  return {
    byId: observable.map(),
    parentIds: observable.map(),
  }
}
