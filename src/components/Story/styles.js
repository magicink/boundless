// noinspection CssUnknownTarget

import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { Grey, Orange } from '../../lib/constants'

export const GlobalStyles = css`
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');

  * {
    box-sizing: border-box;
    font-size: 18px;
    line-height: 1.6;
  }

  body,
  html {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    background-color: ${Grey[400]};
    color: #fff;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: ${Orange[300]};
    font-family: 'Playfair Display', serif;
    font-weight: 400;
    line-height: 2;
    margin: 0;
  }
  h1 {
    font-size: 2.5rem;
  }
  h2 {
    font-size: 2rem;
  }
  h3 {
    font-size: 1.5rem;
  }
  h4 {
    font-size: 1.25rem;
  }
  h5 {
    font-size: 1.2rem;
  }
  h6 {
    font-size: 1rem;
  }

  pre {
    background-color: ${Grey[900]};
    border-radius: thin solid ${Grey[700]};
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
    max-width: 100%;
    padding: 0.5rem;
  }

  blockquote {
    background-color: ${Grey[900]};
    border-radius: thin solid ${Grey[700]};
    line-height: 1.5;
    margin: 0;
    padding: 0.5rem;
  }

  a,
  button {
    background-color: transparent;
    border-bottom: thin dashed;
    border-bottom-color: ${Orange[100]};
    border-left: none;
    border-right: none;
    border-top: none;
    color: ${Orange[100]};
    cursor: pointer;
    display: inline-block;
    font-family: 'Lora', serif;
    padding: 0;
    text-decoration: none;
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out, border-color 0.2s ease-in-out;

    &:hover {
      background-color: ${Grey[900]};
      border-bottom-color: ${Orange[500]};
      color: ${Orange[500]};
    }
  }

  .tw-passage {
    font-family: 'Lora', serif;
  }
`
export const AppContainer = styled.main`
  bottom: 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  overflow-x: hidden;
  overflow-y: auto;
`
