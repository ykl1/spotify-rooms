import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { getQueryStringParams, generateRandomStr } from '../global'
import axios from 'axios'
import Spotify from 'spotify-web-api-js'
import Songs from './Songs'
import Queue from './Queue'

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
  const [currentQueue, setCurrentQueue] = useState([])

  useEffect(() => {
    hostSpotifyApi.getMyCurrentPlaybackState().then((response) => {
      let uri = response.item.uri
      if (currentQueue.length !== 0) {
        if (uri === currentQueue[0].uri) {
          console.log(`This is the current: ${uri}`)
          console.log(`This is the first item in the queue: ${currentQueue[0].uri}`)
          setCurrentQueue(currentQueue.filter((elem => elem.uri !== uri)))
        }
      }
    }).catch((err) => {
      console.log(`Error: ${err}`)
    })
  }, [currPlaying])

  const initialQueue = (elem, i) => {
    setTimeout(() => {
      hostSpotifyApi.queue(elem.uri)
      console.log(i)
    }, 500 * i)
  }

  useEffect(async () => {
    let temp = await axios.post('http://192.168.0.64:8888/roomStorage/roomExists', { roomID })
    if (temp.data) {
      let storedQueue = await axios.post('http://192.168.0.64:8888/roomStorage/getRoomData', { roomID })
      let i = 0
      storedQueue.data.forEach((elem) => {
        initialQueue(elem, i)
        i += 1
      })
      setCurrentQueue(storedQueue.data)
    }

    socket.on('host', ({ name, albumArt, is_playing }) => {
      console.log('this is the returned test jawn on host')
    })

    socket.on('queueDisplay', ({ uri, name, albumArt, artist }) => {
      setCurrentQueue(searchList => [...searchList, { uri, name, albumArt, artist }])
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
    }, 1250)
    return () => {
      clearInterval(interval)
      setCurrentQueue([])
    }
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

  const saveRoom = async () => {
    hostSpotifyApi.pause().catch((err) => {
      console.log(`Error: ${err}`)
    })
    try {
      let temp = await axios.post('http://192.168.0.64:8888/roomStorage/roomExists', { roomID })
      let queue = currentQueue
      if (temp.data) {
        console.log('hi')
        await axios.post('http://192.168.0.64:8888/roomStorage/modifyRoomData', { roomID, queue })
      } else {
        await axios.post('http://192.168.0.64:8888/roomStorage/saveRoomData', { roomID, queue })
      }
      socket.emit('hostLeave', { roomID, socketID })
      history.push(`/RoomEntry/access_token=${params.access_token}&refresh_token=${params.refresh_token}`)
    } catch (err) {
      console.log(`Error: ${err}`)
    }
  }

  const leaveRoom = () => {
    hostSpotifyApi.pause().catch((err) => {
      console.log(`Error: ${err}`)
    })
    socket.emit('hostLeave', { roomID, socketID })
    history.push(`/RoomEntry/access_token=${params.access_token}&refresh_token=${params.refresh_token}`)
    
  }

  const skipPlayback = async () => {
    try {
      await hostSpotifyApi.skipToNext()
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
      <div>
        <h1>This is the host room</h1>
        <button onClick={() => saveRoom()}>Save Room and Exit</button>
        <button onClick={() => leaveRoom()}>Exit</button>
        <p>{`Now Playing: ${currPlaying.name}`}</p>
        <img src={`${currPlaying.albumArt}`} style={{ height: 250 }}/>
        <br/>
        <button onClick={() => skipPlayback()}>Skip</button>
        <button onClick={() => resumePlayback()}>Resume</button>
        <button onClick={() => pausePlayback()}>Pause</button>
      </div>

      <div>
        <h1>Current Queue</h1>
        {currentQueue.map(elem => (
          <Queue 
            key={generateRandomStr(5)}
            name={elem.name}
            albumArt={elem.albumArt}
            artist={elem.artist}
          />
        ))}
      </div>

      <div>
        <p>click on song to add to queue</p>
        <input placeholder='Search a song' onChange={(e) => searchSong(e.target.value)} />
        {searchList.map(elem => (
          <Songs 
            key={generateRandomStr(5)}
            socket={socket}
            spotifyApi={hostSpotifyApi}
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