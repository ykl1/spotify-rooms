import React, { useState } from 'react'
import { BrowserRouter as Router, Switch, Route, useParams } from 'react-router-dom'
import Home from './Home'
import RoomEntry from './RoomEntry'
import Room from './Room'

const App = () => {
  const [roomID, setRoomID] = useState('')
  const child = () => {
    setRoomID(useParams())
    return (
      <div><h1>{ roomID }</h1></div>
    )
  }
  
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/RoomEntry" exact>
            <RoomEntry />
          </Route>
          <Route path="/Room/:id" exact>
            <Room />
          </Route>
        </Switch>

      </div>
    </Router>
  )
}

export default App
