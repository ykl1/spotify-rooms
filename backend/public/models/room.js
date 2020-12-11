const { Schema, model } = require('mongoose')

const roomSchema = new Schema({
  roomID: { type: String, required: true },
  queue: [{
    uri: { type: String },
    name: { type: String },
    albumArt: { type: String },
    artist: { type: String }
  }]
},
{ collection: 'rooms' })

module.exports = model('Room', roomSchema)