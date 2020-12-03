import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { getQueryStringParams } from '../global'
import socketIOClient from 'socket.io-client'
const socket = socketIOClient.connect('http://192.168.0.64:8888')

const Room = () => {
  // with roomID, we can get all of the users in room from socket.io,
  // may need to spotify api wrapper as well. 

  const { roomID } = useParams()
  const { socketID } = useParams()
  const { queryParams } = useParams()
  const params = getQueryStringParams(queryParams)
  const history = useHistory()

  const leaveRoom = () => {
    socket.emit('leave', { roomID, socketID })
    history.push(`/RoomEntry/access_token=${params.access_token}&refresh_token=${params.refresh_token}`)
  }

  return (
    <div>
      <h1>This is the music room</h1>
      <button onClick={() => leaveRoom()}>Leave Room</button>
    </div>
  )
}

export default Room
