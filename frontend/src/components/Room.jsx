import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import socketIOClient from 'socket.io-client'
const socket = socketIOClient.connect('http://192.168.0.64:8888')

const Room = ({ roomID, socketID }) => {
  // with roomID, we can get all of the users in room from socket.io,
  // their respective access + refresh tokens, data on who is the host, etc.
  // may need to spotify api wrapper as well. 

  const leaveRoom = () => {
    socket.emit('leave', roomID)
  }

  return (
    <div>
      <h1>This is the music room</h1>
      <button onClick={() => leaveRoom()}>Leave Room</button>
    </div>
  )
}

export default Room
