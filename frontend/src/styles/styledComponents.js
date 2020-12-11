import s from 'styled-components'

export const RowWrapper = s.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  font-family: Open Sans;
`

export const Wrapper = s.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-family: Open Sans;
`

export const Input = s.input`
  width: ${(props) => (props.search ? '17.5em' : '7.25em')};
  padding: 0.5em;
  margin: 0.5vh;
  color: black;
  background: white;
  border: 0.15em solid rgba(99, 183, 255, 0.40);
  border-radius: 0.5em;
  font-size: 1em;
`

export const Button = s.button`
  background: ${(props) => (props.home ? '#2ac96a' : '#fa39d7')};
  border: none;
  border-radius: 1.25em;
  margin: 1em 0.5em;
  padding: 1em 1em;
  color: white;
  font-size: 1em;
  outline: none;
`

export const SpotifyButton = s.button`
  background: #6e6969;
  border: none;
  border-radius: 0.3em;
  margin: 0.5em 0.5em;
  padding: 0.2em 0.55em;
  color: #4fdb90;
  font-size: 1em;
  outline: none;
`