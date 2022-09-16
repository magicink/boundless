import { getPassageByName, getPassageByPid } from './index'
import { useStory } from '../hooks/useStory'

describe('getPassageByPid', () => {
  it('returns the correct passage', () => {
    const testPassage = { pid: 'test' }
    useStory.setState({
      passages: [testPassage]
    })
    const result = getPassageByPid('test')
    expect(result).toEqual(testPassage)
  })
})
describe('getPassageByName', () => {
  it('returns the correct passage', () => {
    const testPassage = { name: 'test' }
    useStory.setState({
      passages: [testPassage]
    })
    const result = getPassageByName('test')
    expect(result).toEqual(testPassage)
  })
})
