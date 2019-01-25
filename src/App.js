import React from 'react'
import { DefaultButton, FocusZone } from 'office-ui-fabric-react'
import { observer } from 'mobx-react'

const App = observer(() => (
  <FocusZone isCircularNavigation={true}>
    <div className="w-80 center sans-serif">
      <div className="mt3 f4 ttu tracked">Tree Notes</div>
      <div className="mt3 flex">
        <DefaultButton text="delete all" />
        <DefaultButton className="ml3" text="add" />
      </div>
      <div className="mt3" />
    </div>
  </FocusZone>
))
export default App
