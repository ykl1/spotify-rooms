import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import Spotify from 'spotify-web-api-js'
import { getQueryStringParams, generateRandomStr } from '../global'
import Songs from './Songs'
import Queue from './Queue'
import { RowWrapper, Wrapper, SpotifyButton, Input } from '../styles/styledComponents'

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
  const [roomTerminated, setRoomTerminated] = useState(false)
  const [currentQueue, setCurrentQueue] = useState([])

  useEffect(() => {
    socket.on('currentQueue', currentQueue => {
      setCurrentQueue(currentQueue)
    })

    socket.on('hostLeft', (hi) => {
      console.log(hi)
      setRoomTerminated(true)
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
    return () => {
      setRoomTerminated(false)
      setCurrentQueue([])
    }
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
    if (!roomTerminated) {
      socket.emit('memberLeave', { roomID, socketID })
    }
    history.push(`/RoomEntry/access_token=${params.access_token}&refresh_token=${params.refresh_token}`)
  }

  return (
    <div>
      {!roomTerminated ? (
        <div>
          <RowWrapper style={{ margin: '3em 20em', background: '#1c1c1c', borderRadius: '1em'}}>
            <Wrapper>
              {currPlaying.skipped && (
                <Wrapper>
                  <p style={{ color: '#2ac96a', maxWidth: 300, wordWrap: 'break-word' }}>{`${currPlaying.name}`}</p>
                  <img src={`${currPlaying.albumArt}`} style={{ height: 300, borderRadius: '0.75em', margin: 'auto 3em 1em auto' }}/>
                </Wrapper>
              )}
            </Wrapper>
            <Wrapper>
              <h1 style={{ color: '#2ac96a', fontSize: '1.5em' }}>{`Room Code: ${roomID}`}</h1>
              <SpotifyButton onClick={() => leaveRoom()}>Leave Room</SpotifyButton>
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
                spotifyApi={memberSpotifyApi}
                {...elem}
                isHost={true}
                roomID={roomID}
              />
            ))}
            </div>
          </Wrapper>
        </div>
      ):
      <Wrapper>
        <h1 style={{ color: 'white' }}>Host closed the room</h1>
        <SpotifyButton onClick={() => leaveRoom()}>Go back to the Home page</SpotifyButton>
      </Wrapper>
    }
    </div>
  )
}

export default MemberRoom