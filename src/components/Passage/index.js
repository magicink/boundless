import React, { createElement, Fragment } from 'react'
import { getPassageByName } from '../../utils'
import rehypeBoundless from '../../lib/rehype-boundless'
import rehypeStringify from 'rehype-stringify'
import rehypeReact from 'rehype-react'
import remarkBoundless from '../../lib/remark-boundless'
import remarkDirective from 'remark-directive'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { useStory } from '../../hooks/useStory'
import { Wrapper } from './styles'
import { useApp } from '../../hooks/useApp'

export const Passage = props => {
  const { debug, updated, value } = props

  const [content, setContent] = React.useState(null)

  const passages = useStory(state => state.passages)
  const setPassage = useStory(state => state.setPassage)

  const handleClick = passageName => {
    setPassage(getPassageByName(passageName, passages))
  }

  const process = async value => {
    try {
      const html = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkDirective)
        .use(remarkBoundless)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeBoundless, { classNames: ['tw-link'], onClick: handleClick })
        .use(rehypeStringify)
        .use(rehypeReact, { createElement, Fragment })
        .process(value)
      setContent(html.result)
    } catch (error) {
      console.error(error)
    }
  }

  React.useEffect(() => {
    process(value).then()
  }, [value])

  if (updated) return null

  return (
    <Wrapper className={'tw-passage'}>
      {content}
      {debug && <pre>{JSON.stringify(useApp.getState(), null, 2)}</pre>}
    </Wrapper>
  )
}
