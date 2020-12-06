import React from 'react'

const Songs = ({ hostSpotifyApi, uri, artist, name, albumArt }) => {
  const queueSong = () => {
    try {
      hostSpotifyApi.queue(uri)
    } catch (err) {
      console.log(err)
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