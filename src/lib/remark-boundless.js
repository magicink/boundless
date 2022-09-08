// noinspection JSMismatchedCollectionQueryUpdate

import { h } from 'hastscript'
import { useApp } from '../hooks/useApp'
import { visit } from 'unist-util-visit'

const boundlessTags = ['if', 'include']
const ignoredTags = ['script', 'style', 'noscript', 'link', 'meta', 'br'].concat(boundlessTags)
const textInputs = ['input', 'textarea']
const simpleStringRegex = /^[a-zA-Z0-9_]+$/

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
        let value
        if (key.match(simpleStringRegex)) {
          value = useApp.getState()[key] ?? ''
        } else {
          value = eval(key)
        }
        node.data = {
          hName: hast.tagName,
          hProperties: hast.properties
        }
        node.children = [
          {
            type: 'text',
            value
          }
        ]
      }
    })
    visit(ast, ['containerDirective', 'leafDirective'], node => {
      const { attributes = {}, children = [], data = {}, name = '' } = node
      let hasOnChangeEvent = false
      if (!name.startsWith(' ') && !ignoredTags.includes(name.toLowerCase())) {
        const hast = h(name, attributes, children)
        const events = Object.keys(attributes).filter(key => key.startsWith('on'))

        events.forEach(event => {
          const eventName = event[2].toUpperCase() + event.slice(3)
          if (eventName === 'Change') {
            hasOnChangeEvent = true
          }
          hast.properties[`on${eventName}`] = e => {
            e.preventDefault()
            e.stopPropagation()
            window.eval.call(window, attributes[event])(e.target)
          }
        })

        if (textInputs.includes(name.toLowerCase())) {
          if (attributes['value']) {
            const value = attributes['value']
            if (value.startsWith(':state[') && value.endsWith(']')) {
              const stateKey = value.slice(7, -1)
              if (stateKey.match(simpleStringRegex)) {
                hast.properties.value = useApp.getState()[stateKey] ?? ''
              } else {
                hast.properties.value = eval(stateKey)
              }
            }
          }
          if (!hasOnChangeEvent) {
            hast.properties.readOnly = true
          }
          hast.properties = Object.assign(hast.properties)
        }

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
              if (value && value.match(simpleStringRegex)) {
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
