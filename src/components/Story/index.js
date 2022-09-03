import { AppContainer, GlobalStyles } from './styles'
import { css, Global } from '@emotion/react'
import { getState, parseStoryElement, setPassage } from '../../utils'
import { Passage } from '../Passage'
import React from 'react'
import { useApp } from '../../hooks/useApp'
import { useStory } from '../../hooks/useStory'

export const Story = () => {
  const [updated, setUpdated] = React.useState(false)
  const [debug, setDebug] = React.useState(false)

  const passage = useStory(state => state.passage)
  const stylesheet = useStory(state => state.stylesheet)

  const handleUpdate = () => {
    setUpdated(!updated)
  }

  React.useEffect(() => {
    if (updated) setUpdated(false)
  }, [updated])

  React.useEffect(() => {
    window.App = useApp
    window.Story = useStory
    window.setPassage = setPassage
    window.getState = getState
    const subscription = useApp.subscribe(handleUpdate)
    const dataElement = document.querySelector('tw-storydata')
    parseStoryElement(dataElement, setDebug)
    return () => {
      subscription()
      useApp.destroy()
      useStory.destroy()
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
      <AppContainer className={'tw-story'}>
        {passage && <Passage {...passage} debug={debug} updated={updated} />}
      </AppContainer>
    </>
  )
}
