import { AppContainer, GlobalStyles } from './styles'
import { css, Global } from '@emotion/react'
import { getState, initialize, setPassage } from '../../utils'
import { Passage } from '../Passage'
import React from 'react'
import { useApp } from '../../hooks/useApp'
import { useStory } from '../../hooks/useStory'

export const Story = () => {
  const [debug, setDebug] = React.useState(false)

  const passage = useStory(state => state.passage)
  const stylesheet = useStory(state => state.stylesheet)

  React.useEffect(() => {
    Object.assign(window, { App: useApp, getState, setPassage, Story: useStory })
    const { debug } = initialize()
    setDebug(debug)
    return () => {
      useApp.destroy()
      useStory.destroy()
    }
  }, [])

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
      <AppContainer className={'tw-story'}>{passage && <Passage {...passage} debug={debug} />}</AppContainer>
    </>
  )
}
