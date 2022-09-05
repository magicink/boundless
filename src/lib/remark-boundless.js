// noinspection JSMismatchedCollectionQueryUpdate

import { h } from 'hastscript'
import { useApp } from '../hooks/useApp'
import { visit } from 'unist-util-visit'

const eventless = ['script', 'style', 'noscript', 'link', 'meta', 'if']

const transformScriptNode = (node, index, parent) => {
  const { children: siblings = [] } = parent
  visit(node, 'paragraph', (child, index, parent = {}) => {
    const { children: siblings = [], name: parentName } = parent
    const { children = [] } = child
    if (parentName === 'script') {
      const values = children.map(child => child.value)
      const script = values.join('')
      eval(script)
      siblings.splice(index, 1)
    }
  })
  siblings.splice(index, 1)
}

export default function remarkBoundless() {
  return ast => {
    visit(ast, 'containerDirective', (node, index, parent) => {
      const { name = '' } = node
      if (name.toLowerCase() === 'script') {
        transformScriptNode(node, index, parent)
      }
    })

    visit(ast, 'textDirective', node => {
      const { attributes = {}, children = [], name = '' } = node
      if (name.toLowerCase() === 'state' && children.length) {
        const key = children[0].value
        // replace the node with a span
        const hast = h('span', { ...attributes, className: 'bdls-state' })
        node.data = {
          hName: hast.tagName,
          hProperties: hast.properties
        }
        node.children = [
          {
            type: 'text',
            value: useApp.getState()[key]
          }
        ]
      }
    })
    visit(ast, ['containerDirective', 'leafDirective'], node => {
      const { attributes = {}, children = [], data = {}, name = '' } = node
      if (!name.startsWith(' ') && !eventless.includes(name.toLowerCase())) {
        const hast = h(name, attributes, children)
        // get all data- attributes
        const dataAttributes = Object.keys(attributes).reduce((acc, key) => {
          if (key.startsWith('data-')) {
            const keyName = key.replace('data-', '')
            if (!keyName.trim()) return acc
            if (key.startsWith('data-num-')) {
              acc[key.replace('data-num-', '')] = Number(attributes[key])
            } else if (key.startsWith('data-obj-')) {
              try {
                acc[key.replace('data-obj-', '')] = JSON.parse(attributes[key])
              } catch (e) {
                acc[key.replace('data-obj-', '')] = attributes[key]
              }
            } else {
              acc[key.replace('data-', '')] = attributes[key]
            }
          }
          return acc
        }, {})
        const events = Object.keys(attributes).filter(key => key.startsWith('on'))

        events.forEach(event => {
          const eventName = event[2].toUpperCase() + event.slice(3)
          hast.properties[`on${eventName}`] = e => {
            e.preventDefault()
            e.stopPropagation()
            window.eval.call(window, attributes[event])(dataAttributes)
          }
        })
        data.hName = hast.tagName
        data.hProperties = Object.assign({}, attributes, hast.properties)
        node.data = data
      }
      if (name === 'if') {
        const { attributes = {}, children = [] } = node
        if (children.length > 1) {
          let evaluation
          visit(node, 'paragraph', (child, index, parent) => {
            const { children: siblings = [] } = parent
            if (index === 0) {
              const { children = [] } = child
              const { value } = children[0] || {}
              if (value && value.match(/^[a-zA-Z0-9_]+$/)) {
                const state = useApp.getState()
                const condition = state[value]
                if (condition) {
                  evaluation = true
                }
              } else {
                // evaluate the value
                evaluation = window.eval.call(window, value)
              }
              // remove this node
              siblings.splice(index, 1)
            }
          })
          if (evaluation) {
            const hast = h('div', attributes, children)
            data.hName = hast.tagName
            data.hProperties = Object.assign({}, attributes, hast.properties)
            node.data = data
          } else {
            node.children = []
          }
        } else {
          node.children = []
        }
      }
    })
  }
}
