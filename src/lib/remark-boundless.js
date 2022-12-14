// noinspection JSMismatchedCollectionQueryUpdate

import ejs from 'ejs'
import { h } from 'hastscript'
import { interpolateState } from '../utils'
import { useApp } from '../hooks/useApp'
import { visit } from 'unist-util-visit'

const boundlessTags = ['ejs', 'if', 'include', 'state']
const ignoredTags = ['head', 'html', 'script', 'style', 'noscript', 'link', 'meta', 'br'].concat(boundlessTags)
const inputTags = ['input', 'textarea', 'select']
const simpleStringRegex = /^!?[a-zA-Z0-9_]+$/

const transformScriptNode = (node, index, parent) => {
  const { children: siblings = [] } = parent
  visit(node, 'paragraph', (child, index, parent = {}) => {
    const { children: siblings = [], name: parentName } = parent
    const { children = [] } = child
    if (parentName === 'script') {
      const values = children.map(child => child.value)
      const script = values.join('')
      window.eval.call(window, script)
      siblings.splice(index, 1)
    }
  })
  siblings.splice(index, 1)
}

const transformOptionNodes = selectNode => {
  const { attributes: selectAttributes = {}, children = [] } = selectNode
  const { name: selectName } = selectAttributes
  children.forEach(child => {
    const { attributes = {}, name } = child
    const { value } = attributes
    if (name === 'option' && useApp.getState()[selectName] === value) {
      attributes['selected'] = true
    }
  })
}

const handleChange = name => e => {
  useApp.setState({ [name]: e.target.value })
}

const handleCheckboxChange = name => () => {
  const checked = useApp.getState()[name] === true
  useApp.setState({ [name]: !checked })
}

const transformIfNode = node => {
  let evaluation = false
  visit(node, 'paragraph', (child, index, parent) => {
    const { children: siblings = [] } = parent
    if (index === 0) {
      const { children = [] } = child
      const { value } = children[0] || {}
      if (value && value.match(simpleStringRegex)) {
        const key = value.startsWith('!') ? value.substring(1) : value
        const state = useApp.getState()
        const condition = state[key]
        evaluation = value.startsWith('!') ? !condition : condition
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

const transformEjsNode = node => {
  const { children = [] } = node
  if (children.length) {
    node.data = {
      hName: 'div',
      hProperties: {
        dangerouslySetInnerHTML: {
          __html: interpolateState(ejs.render(children[0]?.value ?? '', useApp.getState()))
        }
      }
    }
  }
}

const parseAttributes = (attributes = {}) => {
  Object.keys(attributes).forEach(key => {
    if (typeof attributes[key] === 'string') {
      attributes[key] = interpolateState(attributes[key])
    }
  })
}

export default function remarkBoundless() {
  return ast => {
    visit(ast, 'containerDirective', (node, index, parent) => {
      const { name = '' } = node
      if (name.toLowerCase() === 'script') {
        transformScriptNode(node, index, parent)
      }
    })

    visit(ast, ['containerDirective', 'leafDirective', 'textDirective'], node => {
      const { attributes = {}, children = [], data = {}, name = '' } = node
      const lowerCaseName = name.toLowerCase()
      const nodeType = node.type
      parseAttributes(attributes)
      let hasOnChangeEvent = false
      if (!name.startsWith(' ') && !ignoredTags.includes(lowerCaseName)) {
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

        const isInput = inputTags.includes(lowerCaseName)
        const isSelect = lowerCaseName === 'select'

        if (isInput) {
          const { name = '', type, value } = attributes
          if (!hasOnChangeEvent && attributes.name) {
            if (type === 'checkbox') {
              hast.properties.onChange = handleCheckboxChange(name)
            } else {
              hast.properties.onChange = handleChange(name)
            }
          }
          if (isSelect) {
            transformOptionNodes(node)
          } else {
            node.children = []
            if (type === 'radio' && value) {
              hast.properties.checked = useApp.getState()[name] === value
            } else {
              hast.properties.value = useApp.getState()[name] ?? value
            }
          }
          hast.properties = Object.assign(hast.properties)
        }
        data.hName = hast.tagName
        data.hProperties = Object.assign({}, attributes, hast.properties)
        node.data = data
      }
      if (lowerCaseName === 'if' && nodeType === 'containerDirective') {
        const { attributes = {}, children = [] } = node
        if (children.length > 1) {
          let evaluation = transformIfNode(node)
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
      if (lowerCaseName === 'state' && nodeType === 'textDirective' && children.length) {
        const key = children[0].value
        // replace the node with a span
        const hast = h('span', attributes)
        let value
        if (key.startsWith('!')) {
          value = !useApp.getState()[key.substring(1)]
        } else {
          value = useApp.getState()[key]
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
      if (lowerCaseName === 'eval' && nodeType === 'textDirective' && children.length) {
        const { children = [] } = node
        if (children.length) {
          const value = children[0].value
          const hast = h('span', attributes)
          node.data = {
            hName: hast.tagName,
            hProperties: hast.properties
          }
          node.children = [
            {
              type: 'text',
              value: window.eval.call(window, value)
            }
          ]
        }
      }
      if (lowerCaseName === 'ejs') {
        transformEjsNode(node)
      }
    })
  }
}
