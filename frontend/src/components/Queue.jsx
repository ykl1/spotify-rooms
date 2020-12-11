import React from 'react'

// is uri necessary?
const Queue = ({ name, albumArt, artist }) => {
  return (
    <div>
      <img src={`${albumArt}`} style={{ height: 45, display: 'inline-block' }}/>
      <p style={{ display: 'inline-block' }}>{artist}: </p>
      <p style={{ display: 'inline-block' }}>{name}</p>
    </div>
  )
}

export default Queue