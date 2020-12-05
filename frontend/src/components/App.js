import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Home from './Home'
import RoomEntry from './RoomEntry'
import HostRoom from './HostRoom'
import MemberRoom from './MemberRoom'
import socketIOClient from 'socket.io-client'
const socket = socketIOClient.connect('http://192.168.0.64:8888')

const App = () => (
  <Router>
    <div>
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
