import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { getHashParams } from '../global'
import socketIOClient from 'socket.io-client'
const socket = socketIOClient.connect('http://192.168.0.64:8888')

const RoomEntry = () => {
  const [roomID, setRoomID] = useState('')
  const history = useHistory()
  const params = getHashParams()

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
    history.push(`/Room/${room}/${id}`)
  })

  const joinRoom = () => {
    userInfo.host = false
    socket.emit('joinRoom', { roomID, userInfo })
  }

  socket.on('isJoined', ({ isValidRoom, id }) => {
    if (isValidRoom) {
      history.push(`/Room/${roomID}/${id}`)
    } else {
      alert('Room does not exist, please try again.')
    }
  })

  const generateRandomStr = (length) => {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
  }

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
