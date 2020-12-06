import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { getQueryStringParams } from '../global'
import Spotify from 'spotify-web-api-js'
import Songs from './Songs'

const HostRoom = ({ socket }) => {
  const hostSpotifyApi = new Spotify()
  const { roomID } = useParams()
  const { socketID } = useParams()
  const { queryParams } = useParams()
  const params = getQueryStringParams(queryParams)
  hostSpotifyApi.setAccessToken(params.access_token)
  const history = useHistory()

  const [currPlaying, setNowPlaying] = useState({ name: 'Not Checked', albumArt: '' })
  const [songSearch, setSongSearch] = useState('')
  const [searchList, setSearchList] = useState([])

// boolean 

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     hostSpotifyApi.getMyCurrentPlaybackState()
  //       .then((response) => {
  //         if (currPlaying.name !== response.item.name) {
  //           setNowPlaying({
  //             name: response.item.name,
  //             albumArt: response.item.album.images[0].url
  //           })
  //         }
  //       }).catch((err) => {
  //         console.log(err)
  //       })
  //   }, 5000)
  //   return () => clearInterval(interval)
  // }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      hostSpotifyApi.getMyCurrentPlaybackState()
      .then((response) => {
        let name = response.item.name
        let albumArt = response.item.album.images[0].url
        let is_playing = response.is_playing
        let uri = response.item.uri
        let progress_ms = response.progress_ms + 300

        socket.emit('currentUserInfo', {
          is_playing,
          uri,
          progress_ms,
          roomID,
          name,
          albumArt,
        })
      }).catch((err) => {
        console.log(err)
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  socket.on('host', data => {
    console.log(data)
  })

  // // get queued songs from non-host users
  // socket.on('getQueuedSong', data => {

  // })

  const searchSong = async (elem) => {
    setSongSearch(elem)
    setSearchList([])
    try {
      const response = await hostSpotifyApi.searchTracks(songSearch)
      response.tracks.items.forEach((track) => {
        setSearchList(searchList => searchList.concat({
          uri: track.uri,
          artist: track.artists[0].name,
          name: track.name,
          albumArt: track.album.images[0].url
        }))
      })
    } catch (err) {
      console.log(err)
    }
  }

  const leaveRoom = () => {
    try {
      hostSpotifyApi.pause()
    } catch (err) {
      console.log(err)
    }
    socket.emit('leave', { roomID, socketID })
    history.push(`/RoomEntry/access_token=${params.access_token}&refresh_token=${params.refresh_token}`)
  }

  const skipPlayback = () => {
    try {
      hostSpotifyApi.skipToNext()
    } catch (err) {
      console.log(err)
    }
  }

  const resumePlayback = () => {
    try {
      hostSpotifyApi.play()
    } catch (err) {
      console.log(err)
    }
  }

  const pausePlayback = () => {
    try {
      hostSpotifyApi.pause()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div>
      <h1>This is the host room</h1>
      <button onClick={() => leaveRoom()}>Leave Room</button>
      <div>
        Now Playing: { `${currPlaying.name}` }
      </div>
      <img src={`${currPlaying.albumArt}`} style={{ height: 250 }}/>
      <br/>
      <button onClick={() => skipPlayback()}>Skip</button>
      <button onClick={() => resumePlayback()}>Resume</button>
      <button onClick={() => pausePlayback()}>Pause</button>
      <h1>click on song to queue it!</h1>
      <input placeholder='Search a song' onChange={(e) => searchSong(e.target.value)} />
      <div>
        {searchList.map(elem => (
          <Songs 
            key={elem.uri}
            hostSpotifyApi={hostSpotifyApi}
            {...elem}
          />
        ))}
      </div>
    </div>
  )
}

export default HostRoom