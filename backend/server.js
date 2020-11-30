const express = require('express')
const path = require('path')
const http = require('http')

const cors = require('cors')
const cookieParser = require('cookie-parser')
const oauth = require('./public/routes/oauth')
const e = require('express')

const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser())

app.use(oauth)

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

io.on('connection', socket => {
  console.log('a user is connected')

  // to all clients, except client that is connecting
  // socket.broadcast.emit('user joined the room!')

  // creating a room. 
  socket.on('create', room => {
    socket.join(room)
    console.log(socket.rooms)
    console.log(`Room ${room} has been created, and ${socket.id} is the host`)
    console.log(io.sockets.adapter.rooms)
  })

  // joining a room
  socket.on('join', room => {
    // need to use boolean because cannot break/return in a for each loop. 
    let isValidRoom = false
    // checking if the room exists or not.
    for (let [key, value] of io.sockets.adapter.rooms) {
      if (key === room) {
        isValidRoom = true
      }
    }
    if (isValidRoom) {
      socket.join(room)
      console.log(`${socket.id} successfully joined room ${room}`)
      console.log(io.sockets.adapter.rooms)
    } else {
      console.log('room does not exist')
    }
    // when you join a specific room, access token + refresh token needs to be stored + accessible. 
  })

  socket.on('leave', room => {
    socket.leave(room)
    console.log(io.sockets.adapter.rooms)
  })

  // when user disconnects
  socket.on('disconnect', () => {
    console.log('the user is disconnected')
  })
})

console.log('Listening on 8888')
server.listen(8888)