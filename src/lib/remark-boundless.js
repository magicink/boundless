// noinspection JSMismatchedCollectionQueryUpdate

import { h } from 'hastscript'
import { useApp } from '../hooks/useApp'
import { visit } from 'unist-util-visit'

const boundlessTags = ['if', 'include']
const ignoredTags = ['script', 'style', 'noscript', 'link', 'meta', 'br'].concat(boundlessTags)
const inputTags = ['input', 'textarea']
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

const transformOptionNodes = selectNode => {
  const { attributes: selectAttributes = {}, children = [] } = selectNode
  const { name: selectName } = selectAttributes
  children.forEach(child => {
    const { attributes = {} } = child
    const { value } = attributes
    if (useApp.getState()[selectName] === value) {
      attributes['selected'] = true
    }
  })
}

const transformIfNodes = node => {
  let evaluation = false
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
  return evaluation
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

        const isInput = inputTags.includes(name.toLowerCase())
        const isSelect = name.toLowerCase() === 'select'

        if (isInput) {
          node.children = []
          const { name = '', type, value } = attributes
          switch (type) {
            case 'checkbox':
              hast.properties.checked = useApp.getState()[name] === true
              break
            case 'radio':
              if (value) {
                hast.properties.checked = useApp.getState()[name] === value
              }
              break
            default:
              hast.properties.value = useApp.getState()[name] ?? value
          }
          hast.properties = Object.assign(hast.properties)
        }
        if (isSelect) {
          transformOptionNodes(node)
        }
        data.hName = hast.tagName
        data.hProperties = Object.assign({}, attributes, hast.properties)
        node.data = data
      }
      if (name === 'if') {
        const { attributes = {}, children = [] } = node
        if (children.length > 1) {
          let evaluation = transformIfNodes(node)
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
