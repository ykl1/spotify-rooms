import React from 'react'

const Songs = ({ socket, spotifyApi, uri, artist, name, albumArt, isHost, roomID }) => {
  const queueSong = () => {
    if (isHost) {
      try {
        socket.emit('queueDisplay', { uri, name, albumArt, roomID, isHost, artist })
        spotifyApi.queue(uri)
      } catch (err) {
        console.log(err)
      }
    } else {
      socket.emit('queueFromMember', { uri, roomID } )
      socket.emit('queueDisplay', { uri, name, albumArt, roomID, isHost, artist })
    }
  }
  
  return (
    <div style={{ margin: '0.25em' }} onClick={() => queueSong()}>
      <img src={`${albumArt}`} style={{ height: 45, display: 'inline-block', borderRadius: '0.25em' }}/>
      <p style={{ color: '#b8b8b8', display: 'inline-block'}}>{`${artist}: ${name}`}</p>
    </div>
  )
}

export default Songs