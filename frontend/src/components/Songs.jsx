import React from 'react'

const Songs = ({ socketOrApi, uri, artist, name, albumArt, isHost, roomID }) => {
  const queueSong = () => {
    if (isHost) {
      try {
        socketOrApi.queue(uri)
      } catch (err) {
        console.log(err)
      }
    } else {
      socketOrApi.emit('queueFromMember', { uri, roomID } )
      console.log('hihihihi')
    }
  }
  
  return (
    <div onClick={() => queueSong()}>
      <img src={`${albumArt}`} style={{ height: 45, display: 'inline-block' }}/>
      <p style={{ display: 'inline-block' }}>{artist}: </p>
      <p style={{ display: 'inline-block' }}>{ name}</p>
    </div>
  )
}

export default Songs