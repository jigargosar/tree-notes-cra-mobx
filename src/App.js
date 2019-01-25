import React from 'react'
import { DefaultButton, FocusZone } from 'office-ui-fabric-react'
import { observer } from 'mobx-react'
import { types as t } from 'mobx-state-tree'
import * as faker from 'faker'
import * as nanoid from 'nanoid'

let Note = t.model('Note', {
  _id: t.optional(t.identifier, () => `N__${nanoid()}`),
  title: t.optional(t.string, () => faker.name.lastName(null)),
})
const Store = t.model('Store', {
  title: 'HOO',
  byId: t.map(Note),
  parentIds: t.map(t.string),
})

const store = Store.create()

const App = observer(() => (
  <FocusZone isCircularNavigation={true}>
    <div className="w-80 center sans-serif">
      <div className="mt3 f4 ttu tracked">Tree Notes</div>
      <div className="mt3 flex">
        <DefaultButton text="delete all" />
        <DefaultButton className="ml3" text="add" />
      </div>
      <div className="mt3">{store.title}</div>
    </div>
  </FocusZone>
))

export default App
