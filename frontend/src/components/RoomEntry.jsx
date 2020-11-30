import React, { useState } from 'react'
import socketIOClient from 'socket.io-client'
const socket = socketIOClient.connect('http://192.168.0.64:8888')

const RoomEntry = () => {

  // getting the access token in React. 
  // const getHashParams = () => {
  //   let hashParams = {}
  //   let e, r = /([^&;=]+)=?([^&;]*)/g,
  //       q = window.location.hash.substring(1)
  //   e = r.exec(q)
  //   while (e) {
  //     hashParams[e[1]] = decodeURIComponent(e[2])
  //     e = r.exec(q)
  //  }
  //  return hashParams
  // }
  // const params = getHashParams()
  // console.log(params)

  const [roomID, setRoomID] = useState('')

  const createRoom = () => {
    const room = generateRandomStr(5)
    setRoomID(room)
    socket.emit('create', room)
  }

  const joinRoom = () => {
    socket.emit('join', roomID)
  }

  const leaveRoom = () => {
    socket.emit('leave', roomID)
  }

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
      <br />
      <button onClick={() => leaveRoom()}>Leave Room</button>
    </div>
  )
}

export default RoomEntry
