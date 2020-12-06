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
  const [currPlaying, setNowPlaying] = useState({})
  const [songSearch, setSongSearch] = useState('')
  const [searchList, setSearchList] = useState([])

  // useEffect(() => {
  //   if (currPlaying.is_playing) {
  //     try {
  //       memberSpotifyApi.play({
  //         uris: [currPlaying.uri],
  //         'position_ms': currPlaying.progress_ms
  //       })
  //     } catch (err) {
  //       console.log(err)
  //     }
  //   } else {
  //     try {
  //       memberSpotifyApi.pause()
  //     } catch (err) {
  //       console.log(err)
  //     }
  //   }
  // }, [])

  socket.on('hostInfo', ({ is_playing, uri, progress_ms, name, albumArt }) => {
    console.log(is_playing)
    // setNowPlaying({ 
    //   is_playing,
    //   uri,
    //   progress_ms,
    //   name,
    //   albumArt,
    // })

    if (is_playing) {
      try {
        console.log('hi')
        memberSpotifyApi.play({
          uris: [uri],
          'position_ms': progress_ms
        })
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
  })

  // const searchSong = async (elem) => {
  //   setSongSearch(elem)
  //   setSearchList([])
  //   try {
  //     const response = await hostSpotifyApi.searchTracks(songSearch)
  //     response.tracks.items.forEach((track) => {
  //       setSearchList(searchList => searchList.concat({
  //         uri: track.uri,
  //         artist: track.artists[0].name,
  //         name: track.name,
  //         albumArt: track.album.images[0].url
  //       }))
  //     })
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }

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
      <div>
        Now Playing: { `${currPlaying.name}` }
      </div>
      <div>
        <img src={`${currPlaying.albumArt}`} style={{ height: 150 }}/>
      </div>
      {/* <div>
        {searchList.map(elem => (
          <Songs 
            key={elem.uri}
            hostSpotifyApi={hostSpotifyApi}
            {...elem}
          />
        ))}
      </div> */}
    </div>
  )
}

export default MemberRoom