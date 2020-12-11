import React from 'react'

const Songs = ({ socket, spotifyApi, uri, artist, name, albumArt, isHost, roomID }) => {
  const queueSong = () => {
    if (isHost) {
      try {
        socket.emit('queueDisplay', { uri, name, albumArt, roomID, isHost, artist })
        // display a list of the current songs in the queue
        // pop it out when the current song changes; have it in a data structure (array)
        // once the host leaves, store all of these songs + use the roomStorage/saveRoomData.
        // joining an existing, room, you get all of these queued songs that weren't played, queue all of them. 
        spotifyApi.queue(uri)
      } catch (err) {
        console.log(err)
      }
    } else {
      socket.emit('queueFromMember', { uri, roomID } )
      socket.emit('queueDisplay', { uri, name, albumArt, roomID, isHost, artist })
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