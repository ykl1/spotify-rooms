import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { getQueryStringParams, generateRandomStr } from '../global'
import axios from 'axios'
import Spotify from 'spotify-web-api-js'
import Songs from './Songs'
import Queue from './Queue'
import { RowWrapper, Wrapper, SpotifyButton, Input } from '../styles/styledComponents'

const HostRoom = ({socket}) => {
  const hostSpotifyApi = new Spotify()
  const { roomID } = useParams()
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
          setCurrentQueue(currentQueue.filter((elem => elem.uri !== uri)))
        }
      }
    }).catch((err) => {
      console.log(`Error: ${err}`)
    })
    socket.emit('queueToMember', { roomID, currentQueue })
  }, [currPlaying])

  const initialQueue = (elem, i) => {
    setTimeout(() => {
      hostSpotifyApi.queue(elem.uri)
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
        await axios.post('http://192.168.0.64:8888/roomStorage/modifyRoomData', { roomID, queue })
      } else {
        await axios.post('http://192.168.0.64:8888/roomStorage/saveRoomData', { roomID, queue })
      }
      socket.emit('hostLeave', { roomID })
      history.push(`/RoomEntry/access_token=${params.access_token}&refresh_token=${params.refresh_token}`)
    } catch (err) {
      console.log(`Error: ${err}`)
    }
  }

  const leaveRoom = () => {
    hostSpotifyApi.pause().catch((err) => {
      console.log(`Error: ${err}`)
    })
    socket.emit('hostLeave', { roomID })
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
      <RowWrapper style={{ margin: '3em 15em', background: '#1c1c1c', borderRadius: '1em'}}>
        <Wrapper style={{ margin: 'auto 4em' }}>
          <p style={{ color: '#2ac96a', maxWidth: 300, wordWrap: 'break-word' }}>{`${currPlaying.name}`}</p>
          <img src={`${currPlaying.albumArt}`} style={{ height: 300, borderRadius: '0.75em' }}/>
          <br/>
          <RowWrapper>
            <SpotifyButton onClick={() => skipPlayback()}>Skip</SpotifyButton>
            <SpotifyButton onClick={() => resumePlayback()}>Resume</SpotifyButton>
            <SpotifyButton onClick={() => pausePlayback()}>Pause</SpotifyButton>
          </RowWrapper>
        </Wrapper>
        <Wrapper style={{ margin: 'auto 4em'}}>
          <h1 style={{ color: '#2ac96a', fontSize: '1.5em' }}>{`Room Code: ${roomID}`}</h1>
          <RowWrapper>
            <SpotifyButton onClick={() => saveRoom()}>Save Room and Exit</SpotifyButton>
            <SpotifyButton onClick={() => leaveRoom()}>Exit</SpotifyButton>
          </RowWrapper>
        </Wrapper>
      </RowWrapper>
      <Wrapper>
        <h1 style={{ color: 'white', fontSize: '2em' }}>Queue</h1>
      </Wrapper>
      <Wrapper>
        <div>
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
          <Input search placeholder='Search a song' onChange={(e) => searchSong(e.target.value)} />
        </div>
      </Wrapper>
      <Wrapper>
        <div>
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
      </Wrapper>
    </div>
  )
}

export default HostRoom