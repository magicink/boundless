import { AppContainer, GlobalStyles } from './styles'
import { css, Global } from '@emotion/react'
import { extractStoryData, getPassageByName, getPassageByPid } from '../../utils'
import { fromDom } from 'hast-util-from-dom'
import { Passage } from '../Passage'
import React from 'react'
import { useGame } from '../../hooks/useGame'
import { useStory } from '../../hooks/useStory'

export const Story = () => {
  const passage = useStory(state => state.passage)
  const stylesheet = useStory(state => state.stylesheet)
  const setPassage = useStory(state => state.setPassage)

  React.useEffect(() => {
    window.Game = useGame
    window.Story = useStory
    const dataElement = document.querySelector('tw-storydata')
    if (dataElement) {
      const storyHast = fromDom(dataElement)
      const story = extractStoryData(storyHast)
      const { data = {} } = story
      const { startnode } = data
      useStory.setState(story)
      setPassage(getPassageByPid(startnode))
    }
    const onPopState = () => {
      // get the passage name history
      const { state } = window.history
      const { passage = {} } = state
      const { name } = passage
      setPassage(getPassageByName(name))
    }
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [])
  React.useEffect(() => {
    if (passage) {
      // check if the passage.name is in the history
      const { state } = window.history
      if (state && state.passage && state.passage.name === passage.name) {
        return
      }
      history.replaceState({ passage }, null, `#${encodeURIComponent(passage.name)}`)
    }
  }, [passage])
  return (
    <>
      <Global styles={GlobalStyles} />
      <Global
        styles={{
          ...css`
            ${stylesheet}
          `
        }}
      />
      <AppContainer className={'tw-story'}>{passage && <Passage {...passage} />}</AppContainer>
    </>
  )
}
