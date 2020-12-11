const express = require('express')

const Room = require('../models/room')

const router = express.Router()

// checks if the room exists in the backend. 
router.post('/roomExists', async (req, res) => {
  const { roomID } = req.body
  await Room.find({ roomID: roomID }, (err, allRooms) => {
    if (err) {
      res.send(false)
    } if (allRooms.length === 0) {
      res.send(false)
    } else {
      res.send(true)
    }
  })
})

// store room + queued songs once the host leaves the room (when first time host leaves)
router.post('/saveRoomData', async (req, res, next) => {
  const { roomID, queue } = req.body
  try {
    await Room.create({ roomID, queue })
    res.send(`Room ${roomID} has successfully been saved`)
  } catch {
    next(new Error('unsuccessful room save'))
  }
})

// get room queued songs if room exists, and a user joins it. 
router.post('/getRoomData', async (req, res) => {
  const { roomID } = req.body
  await Room.find({ roomID: roomID }, (err, allRooms) => {
    if (err) {
      res.send('No queued songs')
    } else {
      res.send(allRooms[0].queue)
    }
  })
})

// modify an existing room data, once you leave it. 
router.post('/modifyRoomData', async (req, res, next) => {
  const { roomID, queue } = req.body
  try {
    await Room.findOneAndUpdate({ roomID, queue })
    res.send('successfully updated the queue')
  } catch {
    next(new Error('unable to update the queue'))
  }
})

module.exports = router