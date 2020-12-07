import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { getQueryStringParams, generateRandomStr } from '../global'

const RoomEntry = ({ socket }) => {
  const [roomID, setRoomID] = useState('')
  const history = useHistory()
  const { queryParams } = useParams()
  const params = getQueryStringParams(queryParams)
  
  const userInfo = {
    host: true,
    access_token: params.access_token,
    refresh_token: params.refresh_token,
  }

  const createRoom = () => {
    const room = generateRandomStr(5)
    socket.emit('create', { room, userInfo })
  }

  socket.on('isCreated', ({ room, id }) => {
    history.push(`/HostRoom/${room}/${id}/access_token=${params.access_token}&refresh_token=${params.refresh_token}`)
  })

  const joinRoom = () => {
    userInfo.host = false
    socket.emit('joinRoom', { roomID, userInfo })
  }

  socket.on('isJoined', ({ isValidRoom, id }) => {
    if (isValidRoom) {
      history.push(`/MemberRoom/${roomID}/${id}/access_token=${params.access_token}&refresh_token=${params.refresh_token}`)
    } else {
      alert('Room does not exist, please try again.')
    }
  })

  return (
    <div>
      <button onClick={() => createRoom()}>Create Room</button>
      <br />
      <input placeholder='Room ID' onChange={(e) => setRoomID(e.target.value)} />
      <button onClick={() => joinRoom()}>Join Room</button>      
    </div>
  )
}

export default RoomEntry
