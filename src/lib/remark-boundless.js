import { h } from 'hastscript'
import { visit } from 'unist-util-visit'
export default function remarkBoundless() {
  return ast => {
    visit(ast, 'leafDirective', node => {
      const { attributes = {}, data = {}, name } = node
      if (name === 'hr') {
        const hast = h(name, attributes)
        data.hName = hast.tagName
        data.hProperties = hast.properties
        node.data = data
      }
    })
    visit(ast, 'containerDirective', node => {
      const { attributes = {}, children = [], data = {}, name } = node
      if (name === 'button') {
        const hast = h(name, attributes, children)
        data.hName = hast.tagName
        data.hProperties = hast.properties
        node.data = data
      }
    })
    visit(ast, 'paragraph', (node, index, parent = {}) => {
      // noinspection JSMismatchedCollectionQueryUpdate
      const { children: siblings = [], name: parentName } = parent
      const { children = [] } = node
      if (parentName === 'script') {
        const values = children.map(child => child.value)
        const script = values.join('')
        eval(script)
        siblings.splice(index, 1)
      }
    })
  }
}
