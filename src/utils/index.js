import { useStory } from '../hooks/useStory'
import { visit } from 'unist-util-visit'
import { useApp } from '../hooks/useApp'
import { fromDom } from 'hast-util-from-dom'

/**
 * returns the passage object for a given PID
 * @param pid
 * @returns {unknown}
 */
export const getPassageByPid = pid => Object.values(useStory.getState().passages).find(passage => passage.pid === pid)

/**
 * returns the passage object for a given name
 * @param name
 * @returns {unknown}
 */
export const getPassageByName = name =>
  Object.values(useStory.getState().passages).find(passage => passage.name === name)

/**
 * Shortcut for setting the current passage
 * @param value
 */
export const setPassage = value => {
  if (typeof value === 'string') {
    const passage = getPassageByName(value)
    if (passage) {
      useStory.getState().setPassage(passage)
    }
  } else if (typeof value === 'object') {
    const { name } = value
    if (name) {
      const passage = getPassageByName(value.name)
      useStory.getState().setPassage(passage)
    }
  }
}

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

/**
 * Initializes the story state
 * @returns {{debug: boolean}}
 */
export const initialize = () => {
  const dataElement = document.querySelector('tw-storydata')
  if (dataElement) {
    const storyHast = fromDom(dataElement)
    const story = extractStoryData(storyHast)
    const { data = {} } = story
    const { options = '' } = data
    const { startnode } = data
    useStory.setState(story)
    const passage = getPassageByPid(startnode)
    useStory.getState().setPassage(passage)
    return {
      debug: options.includes('debug')
    }
  }
  throw new Error('No story data found')
}

/**
 * Recursively parses the ::include directive
 * @param value
 * @param depth
 * @returns {*}
 */
export const interpolateInclude = (value, depth = 1) => {
  let result = value
  // find all matches in result /::include\[(.*)]/gm
  const matches = result.match(/::include\[(.*)]/gm)
  if (matches && matches.length) {
    // for each match
    matches.forEach(match => {
      // find the passage name
      const name = match.match(/::include\[(.*)]/)[1]
      // get the passage
      const passage = getPassageByName(name)
      if (passage) {
        // replace the match with the passage value
        result = result.replace(`::include[${name}]`, `${passage.value}\n\n`)
      } else {
        console.warn(`Passage "${name}" not found`)
        // replace the match with a blank string
        result = result.replace(match, '')
      }
    })
    // if depth is less than 20
    if (depth < 20) {
      // call parseImports again
      result = interpolateInclude(result, depth + 1)
    }
  }
  return result
}

/**
 * Replaces the value for state directives nested within :state[] calls
 * that cannot be reached by the parser.
 * @param value
 * @returns {*}
 */
export const interpolateState = value => {
  let result = value
  const state = useApp.getState()
  const matches = result.match(/:state\[(.*?)]/)
  if (matches) {
    const [match, key] = matches
    result = result.replace(match, state[key] ?? '')
    result = interpolateState(result)
  }
  return result
}
