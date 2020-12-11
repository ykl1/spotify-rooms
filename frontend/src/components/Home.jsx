import React from 'react'
import { Wrapper, Button } from '../styles/styledComponents'

const Home = () => {
  return (
    <Wrapper style={{ margin: '9em'}}>
      <p style={{ margin: '0em auto 0.75em auto', fontSize: '2em', color: '#d9d9d9' }}>
          Welcome to Spotify Rooms!
      </p>
      <Button home>
        <a style={{ textDecoration: 'none', color: 'white', fontSize: '1.25em' }} href='http://localhost:8888/login'>Log In With Spotify</a>
      </Button>
    </Wrapper>
  )
}

export default Home
