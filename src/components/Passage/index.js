// noinspection JSCheckFunctionSignatures

import { getPassageByName, interpolateInclude } from '../../utils'
import React, { createElement, Fragment } from 'react'
import rehypeBoundless from '../../lib/rehype-boundless'
import rehypeStringify from 'rehype-stringify'
import rehypeReact from 'rehype-react'
import remarkBoundless from '../../lib/remark-boundless'
import remarkDirective from 'remark-directive'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { useApp } from '../../hooks/useApp'
import { useStory } from '../../hooks/useStory'
import { Wrapper } from './styles'

export const Passage = props => {
  const { debug, value } = props

  const [content, setContent] = React.useState(null)
  const [prevState, setPrevState] = React.useState(null)
  const [updating, setUpdating] = React.useState(false)

  const passages = useStory(state => state.passages)
  const setPassage = useStory(state => state.setPassage)
  const appState = useApp(state => state)

  const handleClick = passageName => {
    setPassage(getPassageByName(passageName, passages))
  }

  const process = async value => {
    try {
      const importedResults = interpolateInclude(value)
      const html = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkDirective)
        .use(remarkBoundless)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeBoundless, { classNames: ['bdls-link'], onClick: handleClick })
        .use(rehypeStringify)
        .use(rehypeReact, { createElement, Fragment })
        .process(importedResults)
      setContent(html.result)
    } catch (error) {
      console.error(error)
    }
  }

  React.useEffect(() => {
    const json = JSON.stringify(appState)
    if (prevState !== json) {
      setPrevState(json)
      setUpdating(true)
    }
  }, [appState])

  React.useEffect(() => {
    process(value).then()
    if (updating) {
      setUpdating(false)
    }
  }, [updating])

  // noinspection JSValidateTypes
  return (
    <Wrapper className={'tw-passage'}>
      {content}
      {debug && <pre>{JSON.stringify(useApp.getState(), null, 2)}</pre>}
    </Wrapper>
  )
}
