import React from 'react'
import {
  DefaultButton,
  FocusTrapZone,
  FocusZone,
  TextField,
} from 'office-ui-fabric-react'
import { observer } from 'mobx-react-lite'
import { autorun } from 'mobx'
import { nt, ROOT_NOTE_ID } from './models/Note'

window.nt = nt

nt.hydrate()

function hotDispose(disposer) {
  if (module.hot) {
    module.hot.dispose(disposer)
  }
}

hotDispose(autorun(nt.persist))

const NoteItem = observer(({ id }) => {
  return (
    <div>
      {/* Title */}
      <div className="flex items-center">
        <div className="ph2 code">
          {nt.isCollapsed(id) ? '+' : nt.isExpanded(id) ? '-' : 'o'}
        </div>
        <div
          id={nt.titleDomIdOf(id)}
          className={`mr2 ph2 pv1 flex-auto ${
            nt.getSelectedId() === id ? 'bg-light-blue' : ''
          }`}
          data-is-focusable="true"
          onKeyDown={nt.onTitleKeyDown(id)}
          tabIndex={-1}
          onFocus={nt.onTitleFocus(id)}
        >
          {nt.displayTitle(id)}
        </div>
      </div>
      {/*  Children */}
      {nt.isExpanded(id) && (
        <div className="ml3">
          {nt.childIdsOf(id).map(id => (
            <NoteItem key={id} id={id} nt={nt} />
          ))}
        </div>
      )}
    </div>
  )
})

const RootTree = observer(() => (
  <div>
    {nt.childIdsOf(ROOT_NOTE_ID).map(id => (
      <NoteItem key={id} id={id} />
    ))}
  </div>
))

const App = observer(() => {
  React.useEffect(() => {
    nt.initFocus()
  }, [])

  return (
    <FocusTrapZone>
      <div className="w-80 center sans-serif">
        <div className="mt3 f4 ttu tracked">Tree Notes</div>
        <div className="mt3 flex items-center">
          <FocusZone isCircularNavigation={true}>
            <DefaultButton text="delete all" onClick={nt.deleteAll} />
            <DefaultButton className="ml3" text="add" onClick={nt.onAdd} />
          </FocusZone>
        </div>
        <div className="mt3">
          <div className="flex">
            <div className="w-50">
              <FocusZone isCircularNavigation={true}>
                <RootTree />
              </FocusZone>
            </div>
            <div className="w-50">
              <TextField
                // label="Non-resizable"
                multiline
                autoAdjustHeight
                resizable={false}
                disabled={!nt.getSelected()}
                value={nt.getTextInputValue()}
                onChange={nt.onTextInputChange}
              />
            </div>
          </div>
        </div>
      </div>
    </FocusTrapZone>
  )
})

export default App
