import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { getQueryStringParams, generateRandomStr } from '../global'
import axios from 'axios'
import { RowWrapper, Wrapper, Input, Button } from '../styles/styledComponents'
import Spotify from 'spotify-web-api-js'

const RoomEntry = ({ socket }) => {
  const [roomID, setRoomID] = useState('')
  const history = useHistory()
  const { queryParams } = useParams()
  const params = getQueryStringParams(queryParams)
  const entrySpotifyApi = new Spotify()
  entrySpotifyApi.setAccessToken(params.access_token)
  const [userName, setUserName] = useState('')

  useEffect(async () => {
    const userData = await entrySpotifyApi.getMe()
    setUserName(userData.display_name)
  }, [])
  
  const userInfo = {
    host: true,
    access_token: params.access_token,
    refresh_token: params.refresh_token,
  }

  // checks if the roomID already exists in the database. 
  const createRoom = async () => {
    let roomID = 0
    let roomExists = true
    while (roomExists) {
      roomID = generateRandomStr(5)
      let temp = await axios.post('http://192.168.0.64:8888/roomStorage/roomExists', { roomID })
      roomExists = temp.data
    }
    let room = roomID
    socket.emit('create', { room, userInfo })
  }

  socket.on('isCreated', ({ room, id }) => {
    history.push(`/HostRoom/${room}/${id}/access_token=${params.access_token}&refresh_token=${params.refresh_token}`)
  })

  const joinRoom = () => {
    userInfo.host = false
    socket.emit('joinRoom', { roomID, userInfo })
  }

  socket.on('isJoined', async ({ isValidRoom, id, isEmpty, userInfo, roomID }) => {
    let temp = await axios.post('http://192.168.0.64:8888/roomStorage/roomExists', { roomID })
    if (isValidRoom) {
      if (isEmpty) {
        history.push(`/HostRoom/${roomID}/${id}/access_token=${params.access_token}&refresh_token=${params.refresh_token}`)
      } else {
        history.push(`/MemberRoom/${roomID}/${id}/access_token=${params.access_token}&refresh_token=${params.refresh_token}`)
      }
    } else if (temp.data) {
      let room = roomID
      socket.emit('create', { room, userInfo })
    } else {
      alert('Room does not exist, please try again.')
    }
  })

  return (
    <Wrapper>
      <p style={{ color: 'white', fontSize: '1.5em' }}>{`Hi, ${userName}! `}</p>
      <p style={{ color: 'white', fontSize: '1em' }}>{`Create your own room or enter a room ID to join an existing room.`}</p>
      <RowWrapper>
        <Button home style={{ padding: '0.5em 1em', borderRadius: '0.75em', margin: '6em 3em' }} onClick={() => createRoom()}>Create Room</Button>
        <Wrapper style={{ margin: '6em 3em' }}>
          <Input placeholder='Room ID' onChange={(e) => setRoomID(e.target.value)} />
          <Button style={{ background: '#2199cc', padding: '0.5em 1em', borderRadius: '0.75em' }} onClick={() => joinRoom()}>Join Room</Button>
        </Wrapper>
      </RowWrapper>
    </Wrapper>
  )
}

export default RoomEntry
