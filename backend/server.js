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
})

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser())

app.use(oauth)

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

const allRooms = {}

io.on('connection', socket => {
  console.log('a user is connected')
  const id = socket.id
  // creating a room. 
  socket.on('create', ({ room, userInfo }) => {
    userInfo.id = id
    allRooms[room] = [userInfo]
    socket.emit('isCreated', { room, id })
    console.log(allRooms)
    console.log(`Room ${room} has been created, and ${userInfo} is the host data`)
  })

  // joining a room
  socket.on('joinRoom', ({ roomID, userInfo }) => {
    let isValidRoom = false
    userInfo.id = id
    Object.keys(allRooms).forEach(key => {
      if (key === roomID) {
        isValidRoom = true
        allRooms[key].push(userInfo)
      }
    })
    console.log(allRooms)
    socket.emit('isJoined', { isValidRoom, id })
  })

  socket.on('leave', ({ room, userInfo }) => {
    // if host leaves the room. 

    // if regular person leaves the room. 
    console.log(allRooms)
  })

  // when user disconnects
  socket.on('disconnect', () => {
    console.log('the user is disconnected')
  })
})

console.log('Listening on 8888')
server.listen(8888)