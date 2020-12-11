import React from 'react'

const Queue = ({ name, albumArt, artist }) => {
  return (
    <div style={{ margin: '0.25em' }}>
      <img src={`${albumArt}`} style={{ height: 45, display: 'inline-block', borderRadius: '0.25em' }}/>
      <p style={{ color: '#b8b8b8', display: 'inline-block'}}>{`${artist}: ${name}`}</p>
    </div>
  )
}

export default Queue