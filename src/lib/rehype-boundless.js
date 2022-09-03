import { ignoredTags } from './constants'
import { visit } from 'unist-util-visit'

/**
 * Processes hast tree
 * @param options
 * @returns {(function(*): void)|*}
 */
export default function rehypeBoundless(options) {
  const { classNames = ['bdls-link'], onClick } = options
  return ast => {
    visit(ast, 'text', (node, index, parent) => {
      // noinspection JSMismatchedCollectionQueryUpdate
      const { children: siblings = [], tagName: parentTag } = parent
      const { value } = node
      if (value.includes('[[') && value.includes(']]') && !ignoredTags.includes(parentTag)) {
        const [preLink, ...rest] = value.split('[[')
        const [link, ...postLink] = rest.join('[[').split(']]')

        // split the link by |, ->, or <-
        const [left, ...right] = link.split(/(\||->|<-)/)

        const linkData = {}
        if (right.length > 1) {
          linkData.direction = right[0]
          if (linkData.direction === '<-') {
            linkData.destination = left
            linkData.text = right[1]
          } else {
            linkData.destination = right[1]
            linkData.text = left
          }
        } else {
          linkData.text = left
          linkData.destination = left
        }

        const preNode = {
          type: 'text',
          value: preLink
        }

        const linkNode = {
          children: [
            {
              type: 'text',
              value: linkData.text
            }
          ],
          properties: {
            class: classNames,
            href: '#',
            onClick: e => {
              e.preventDefault()
              onClick && onClick(linkData.destination)
            }
          },
          tagName: 'button',
          type: 'element'
        }

        const postNode = {
          type: 'text',
          value: postLink.join(']]')
        }

        const replacements = []
        if (preNode.value) {
          replacements.push(preNode)
        }
        replacements.push(linkNode)
        replacements.push(postNode)

        siblings.splice(index, 1, ...replacements)
      }
    })
    visit(ast, 'element', (node, index, parent) => {
      const { children: siblings = [], tagName: parentTag } = parent
      const { children = [], tagName } = node
      // find all p tags with a button parent
      if (tagName === 'p' && parentTag === 'button') {
        // remove the p tag
        siblings.splice(index, 1, ...children)
      }
    })
  }
}
