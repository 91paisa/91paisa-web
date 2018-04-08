import styled from 'styled-components'
import { white } from '../styles/colors'

const Card = styled.div`
  box-shadow: 0 2px 4px hsla(0, 0%, 0%, 0.2);
  margin: 1% 1%;
  display: flex;
  background: ${white};
  flex-direction: column;
  padding-bottom: 1rem;
  border-radius: 0.5rem;
  &:hover {
    box-shadow: 0 4px 8px hsla(0, 0%, 0%, 0.1);
  }
  transition-duration: 300ms;
`

export default Card
