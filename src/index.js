import React from 'react'
import ReactDOM from 'react-dom'
import { Story } from './components/Story'

/**
 * Renders the Story
 * @returns {Promise<void>}
 */
const render = () => {
  const rootElement = document.getElementById('story-root')
  // noinspection JSUnresolvedFunction
  const storyRoot = ReactDOM.createRoot(rootElement)
  storyRoot.render(<Story />)
}
;(async () => {
  await render()
})()
