const { Schema, model } = require('mongoose')

const roomSchema = new Schema({
	roomID: { type: String, required: true },
	queue: [{ type: String }]
},
{ collection: 'rooms' })

module.exports = model('Room', roomSchema)