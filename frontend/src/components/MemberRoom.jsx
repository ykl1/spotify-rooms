import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import Spotify from 'spotify-web-api-js'
import { getQueryStringParams, generateRandomStr } from '../global'
import Songs from './Songs'

const MemberRoom = ({ socket }) => {
  const memberSpotifyApi = new Spotify()
  const { roomID } = useParams()
  const { socketID } = useParams()
  const { queryParams } = useParams()
  const params = getQueryStringParams(queryParams)
  memberSpotifyApi.setAccessToken(params.access_token)
  const history = useHistory()
  const [currPlaying, setNowPlaying] = useState({ name: 'none', albumArt: 'none', skipped: false })
  const [songSearch, setSongSearch] = useState('')
  const [searchList, setSearchList] = useState([])

  useEffect(() => {
    socket.on('visualInfo', ({ name, albumArt }) => {
      if (currPlaying.name !== name) {
        setNowPlaying({
          name,
          albumArt,
          skipped: true
        })
      }
    })

    socket.on('hostInfo', ({ is_playing, uri, progress_ms, name, albumArt }) => {
      setNowPlaying({
        name,
        albumArt,
        skipped: true
      })
      console.log('this is the member jawn')
      memberSpotifyApi.getMyCurrentPlaybackState().then((response) => {
        if (response.item.uri !== uri) {
          try {
            memberSpotifyApi.play({
              uris: [uri],
              'position_ms': progress_ms
            })
          } catch (err) {
            console.log(err)
          }
        }
        if (response.is_playing !== is_playing) {
          if (is_playing) {
            try {
              memberSpotifyApi.play()
            } catch (err) {
              console.log(err)
            }
          } else {
            try {
              memberSpotifyApi.pause()
            } catch (err) {
              console.log(err)
            }
          }
        }
      }).catch((err) => {
        console.log(err)
      })
    })
  }, [])

  const searchSong = async (elem) => {
    setSongSearch(elem)
    setSearchList([])
    try {
      const response = await memberSpotifyApi.searchTracks(songSearch)
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
      memberSpotifyApi.pause()
    } catch (err) {
      console.log(err)
    }
    socket.emit('leave', { roomID, socketID })
    history.push(`/RoomEntry/access_token=${params.access_token}&refresh_token=${params.refresh_token}`)
  }

  return (
    <div>
      <h1>This is the member room</h1>
      <button onClick={() => leaveRoom()}>Sync with host</button>
      <button onClick={() => leaveRoom()}>Leave Room</button>
      {currPlaying.skipped && (
        <div>
          <p>Now Playing: { `${currPlaying.name}` }</p>
          <img src={`${currPlaying.albumArt}`} style={{ height: 150 }}/>
        </div>
      )}
      <p>click on song to add to queue</p>
      <input placeholder='Search a song' onChange={(e) => searchSong(e.target.value)} />
      <div>
        {searchList.map(elem => (
          <Songs 
            key={generateRandomStr(5)}
            socketOrApi={socket}
            {...elem}
            isHost={false}
            roomID={roomID}
        />
        ))}
      </div>
    </div>
  )
}

export default MemberRoom