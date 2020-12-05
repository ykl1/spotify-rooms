import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { getQueryStringParams } from '../global'
import Spotify from 'spotify-web-api-js'

const MemberRoom = ({ socket }) => {
  const memberSpotifyApi = new Spotify()
  const { roomID } = useParams()
  const { socketID } = useParams()
  const { queryParams } = useParams()
  const params = getQueryStringParams(queryParams)
  memberSpotifyApi.setAccessToken(params.access_token)
  const history = useHistory()
  const [currPlaying, setNowPlaying] = useState({ name: 'Not Checked', albumArt: '' })
  
  useEffect(() => {
    const interval = setInterval(() => {
      socket.on('hostInfo', ({ is_playing, uri, progress_ms, name, albumArt }) => {
        setNowPlaying({ 
          name,
          albumArt
        })

        if (is_playing) {
          memberSpotifyApi.play({
            uris: [uri],
            'position_ms': progress_ms
          })
        } else {
          memberSpotifyApi.pause()
        }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  socket.on('hostInfo', data => {
    console.log(data)
  })

  const leaveRoom = () => {
    socket.emit('leave', { roomID, socketID })
    history.push(`/RoomEntry/access_token=${params.access_token}&refresh_token=${params.refresh_token}`)
  }

  return (
    <div>
      <h1>This is the member room</h1>
      <button onClick={() => leaveRoom()}>Leave Room</button>
      <div>
        Now Playing: { `${currPlaying.name}` }
      </div>
      <div>
        <img src={`${currPlaying.albumArt}`} style={{ height: 150 }}/>
      </div>
    </div>
  )
}

export default MemberRoom