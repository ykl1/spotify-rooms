import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { getQueryStringParams } from '../global'
import Spotify from 'spotify-web-api-js'


const HostRoom = ({ socket }) => {
  const hostSpotifyApi = new Spotify()
  const { roomID } = useParams()
  const { socketID } = useParams()
  const { queryParams } = useParams()
  const params = getQueryStringParams(queryParams)
  hostSpotifyApi.setAccessToken(params.access_token)
  const history = useHistory()

  const [currPlaying, setNowPlaying] = useState({ name: 'Not Checked', albumArt: '' })

  useEffect(() => {
    const interval = setInterval(() => {
      hostSpotifyApi.getMyCurrentPlaybackState()
        .then((response) => {
          console.log(response)
          let name = response.item.name
          let albumArt = response.item.album.images[0].url
          let is_playing = response.is_playing
          let uri = response.item.uri
          let progress_ms = response.progress_ms

          setNowPlaying({ 
            name, 
            albumArt
          })

          socket.emit('currentUserInfo', {
            is_playing,
            uri,
            progress_ms,
            roomID,
            name,
            albumArt,
          })
        })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const leaveRoom = () => {
    socket.emit('leave', { roomID, socketID })
    history.push(`/RoomEntry/access_token=${params.access_token}&refresh_token=${params.refresh_token}`)
  }

  return (
    <div>
      <h1>This is the host room</h1>
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

export default HostRoom