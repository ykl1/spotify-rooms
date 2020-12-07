import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { getQueryStringParams, generateRandomStr } from '../global'
import Spotify from 'spotify-web-api-js'
import Songs from './Songs'

const HostRoom = ({socket}) => {
  const hostSpotifyApi = new Spotify()
  const { roomID } = useParams()
  const { socketID } = useParams()
  const { queryParams } = useParams()
  const params = getQueryStringParams(queryParams)
  hostSpotifyApi.setAccessToken(params.access_token)
  const history = useHistory()

  const [currPlaying, setNowPlaying] = useState({ name: 'no name', albumArt: 'no url' })
  const [songSearch, setSongSearch] = useState('')
  const [searchList, setSearchList] = useState([])
  const [songSwitched, setSongSwitched] = useState(false)

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     let str = 'hi theredddd23'
  //     socket.emit('test', { str, roomID })
  //   }, 5000)
  //   return () => clearInterval(interval)
  // }, [noRepeats])

  // socket.on('yeet', str => {
  //   setIsPlaying(!isPlaying)
  //   console.log(str)
  // })

  useEffect(() => {
    hostSpotifyApi.getMyCurrentPlaybackState().then((response) => {
      console.log(`useEffect: ${response.item.name}`)
      console.log(`useEffect: ${response.item.album.images[0].url}`)
      setNowPlaying({
        name: response.item.name,
        albumArt: response.item.album.images[0].url
      })
      socket.emit('songVisuals', {
        roomID,
        name: response.item.name,
        albumArt: response.item.album.images[0].url
      })
    }).catch((err) => {
      console.log(`Error: ${err}`)
    })
  }, [songSwitched])

  useEffect(() => {
    // queues song into Host's queue from member room.
    socket.on('host', ({ name, albumArt, is_playing }) => {
      console.log('this is the returned test jawn on host')
    })

    socket.on('queueToHost', uri => {
      hostSpotifyApi.queue(uri)
    })

    const interval = setInterval(() => {
      hostSpotifyApi.getMyCurrentPlaybackState().then((response) => {
        let is_playing = response.is_playing
        let uri = response.item.uri
        let progress_ms = response.progress_ms
        let name = response.item.name
        let albumArt = response.item.album.images[0].url

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
          albumArt
        })
      }).catch((err) => {
        console.log(`Error: ${err}`)
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])


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
      console.log(`Error: ${err}`)
    }
  }

  const leaveRoom = () => {
    hostSpotifyApi.pause().catch((err) => {
      console.log(`Error: ${err}`)
    })
    socket.emit('leave', { roomID, socketID })
    history.push(`/RoomEntry/access_token=${params.access_token}&refresh_token=${params.refresh_token}`)
  }

  const skipPlayback = async () => {
    try {
      await hostSpotifyApi.skipToNext()
      await setTimeout(() => setSongSwitched(!songSwitched), 250)
    } catch (err) {
      console.log(`Error: ${err}`)
    }
  }

  const resumePlayback = async () => {
    try {
      await hostSpotifyApi.play()
      socket.emit('asdf', )
    } catch (err) {
      console.log(`Error: ${err}`)
    }
  }

  const pausePlayback = async () => {
    try {
      await hostSpotifyApi.pause()
    } catch (err) {
      console.log(`Error: ${err}`)
    }
  }

  return (
    <div>
      <h1>This is the host room</h1>
      <button onClick={() => leaveRoom()}>Leave Room</button>
      <div>
        <p>{`Now Playing: ${currPlaying.name}`}</p>
      </div>
      <img src={`${currPlaying.albumArt}`} style={{ height: 250 }}/>
      <br/>
      <button onClick={() => skipPlayback()}>Skip</button>
      <button onClick={() => resumePlayback()}>Resume</button>
      <button onClick={() => pausePlayback()}>Pause</button>
      <p>click on song to add to queue</p>
      <input placeholder='Search a song' onChange={(e) => searchSong(e.target.value)} />
      <div>
        {searchList.map(elem => (
          <Songs 
            key={generateRandomStr(5)}
            socketOrApi={hostSpotifyApi}
            {...elem}
            isHost={true}
            roomID={roomID}
          />
        ))}
      </div>
    </div>
  )
}

export default HostRoom