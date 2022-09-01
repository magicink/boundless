import create from 'zustand'
import produce from 'immer'

export const useStory = create(set => ({
  passage: null,
  data: {},
  passages: {},
  setData: data =>
    set(
      produce(draft => {
        draft.data = data
      })
    ),
  setPassage: passage =>
    set(
      produce(draft => {
        draft.passage = passage
      })
    ),
  setPassages: passages =>
    set(state =>
      produce(state, draft => {
        draft.passages = passages
      })
    ),
  stylesheet: null
}))
