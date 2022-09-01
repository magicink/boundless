import { useStory } from '../hooks/useStory'
import { visit } from 'unist-util-visit'

export const getPassageByPid = pid => Object.values(useStory.getState().passages).find(passage => passage.pid === pid)
export const getPassageByName = name =>
  Object.values(useStory.getState().passages).find(passage => passage.name === name)
/**
 * Extract story data from parsed Twine hast
 * @returns {function(*): {}}
 */
export const extractStoryData = ast => {
  const result = {}
  visit(ast, 'element', node => {
    const { children = [], tagName, properties = {} } = node
    const { id } = properties
    if (tagName === 'tw-storydata') {
      result.data = { ...properties }
    }
    if (id === 'twine-user-stylesheet' && children.length) {
      result.stylesheet = children[0].value
    }
    if (id === 'twine-user-script' && children.length) {
      eval(children[0].value)
    }
    if (tagName === 'tw-passagedata') {
      const { name, pid } = properties
      result.passages = result.passages || {}
      const value = children[0]?.value ?? ''
      result.passages[name] = {
        name,
        pid,
        value
      }
    }
  })
  return result
}
