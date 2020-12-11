import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Home from './Home'
import RoomEntry from './RoomEntry'
import HostRoom from './HostRoom'
import MemberRoom from './MemberRoom'
import socketIOClient from 'socket.io-client'
const socket = socketIOClient('http://192.168.0.64:8888')
import { Wrapper } from '../styles/styledComponents'

const App = () => (
  <Router>
    <div>
      <Wrapper style={{ backgroundColor: '#1c1b1b' }}>
        <h1 style={{ margin: '0.5em', fontSize: '3em', color: '#d9d9d9' }}>Spotify Rooms</h1>
      </Wrapper>
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/RoomEntry/:queryParams" exact>
          <RoomEntry
            socket = {socket}
          />
        </Route>
        <Route path="/HostRoom/:roomID/:socketID/:queryParams" exact>
          <HostRoom 
            socket = {socket}
          />
        </Route>
        <Route path="/MemberRoom/:roomID/:socketID/:queryParams" exact>
          <MemberRoom 
            socket = {socket}
          />
        </Route>
      </Switch>
    </div>
  </Router>
)

export default App
