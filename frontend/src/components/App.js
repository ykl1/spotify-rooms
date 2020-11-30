import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Home from './Home'
import RoomEntry from './RoomEntry'
import Room from './Room'

const App = () => {

  return (
    <Router>
      <div>
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/RoomEntry">
            <RoomEntry />
          </Route>
          <Route path="/Room/">
            <Room />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

export default App
