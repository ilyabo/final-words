import { keyframes } from '@emotion/core'
import styled from '@emotion/styled'

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`

const FadeIn = styled.div`
  animation: ${fadeIn} 3s ease-in;
`


export default FadeIn
