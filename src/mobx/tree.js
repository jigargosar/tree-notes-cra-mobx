import { extendObservable, observable } from 'mobx'
import { createObjMap } from './objMap'

function createTree(rootData) {
  function enhanceNodeData(node) {
    node = extendObservable(node, null, { name: `Node:${node.id}` })
    return extendObservable(node, {})
  }

  function createEnhancedRoot() {
    return enhanceNodeData({
      id: 'ROOT_TREE_ID',
      childIds: [],
      collapsed: false,
      data: rootData,
    })
  }

  function createInitialIdMap() {
    const root = createEnhancedRoot()
    return createObjMap({ [root.id]: root })
  }

  const tree = observable.object(
    {
      idMap: createInitialIdMap(),
      parentIdMap: createObjMap({}, {}),
    },
    null,
    { name: 'MobxTree' },
  )
}
