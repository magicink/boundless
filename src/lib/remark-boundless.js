import { visit } from 'unist-util-visit'
export default function remarkBoundless() {
  return ast => {
    visit(ast, 'paragraph', (node, index, parent = {}) => {
      // noinspection JSMismatchedCollectionQueryUpdate
      const { children: siblings = [], name: parentName } = parent
      const { children = [] } = node
      if (parentName === 'script') {
        // get the values of all the children
        const values = children.map(child => child.value)
        // join them together
        const script = values.join('')
        eval(script)
        // remove the paragraph
        siblings.splice(index, 1)
      }
    })
  }
}
