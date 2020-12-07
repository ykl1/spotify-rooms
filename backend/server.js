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

io.on('connection', (socket) => {
  // when user is connected
  console.log('a user is connected')
  const id = socket.id
  console.log(id)

  // socket.on('test', ({ str, roomID }) => {
  //   console.log('this should be above the other jawns')
  //   socket.emit('yeet', str)
  //   Object.keys(allRooms).forEach(key => {
  //     if (key === roomID) {
  //       console.log('hiyoo')
  //       allRooms[roomID].forEach(obj => {
  //         socket.to(obj.id).emit('testRun', str)
  //       })
  //     }
  //   })
  // })

  socket.on('songVisuals', ({ roomID, name, albumArt }) => {
    Object.keys(allRooms).forEach(key => {
      if (key === roomID) {
        allRooms[roomID].forEach(obj => {
          socket.to(obj.id).emit('visualInfo', { name, albumArt })
        })
      }
    })
  })

  // sends the host's info to all room members. 
  socket.on('currentUserInfo', ({ is_playing, uri, progress_ms, roomID, name, albumArt }) => {
    Object.keys(allRooms).forEach(key => {
      if (key === roomID) {
        allRooms[roomID].forEach(obj => {
          socket.to(obj.id).emit('hostInfo', { is_playing, uri, progress_ms })
          socket.emit('host', { name, albumArt, is_playing })
        })
      }
    })
  })

  // creating a room. 
  socket.on('create', ({ room, userInfo }) => {
    userInfo.id = id
    allRooms[room] = [userInfo]
    socket.emit('isCreated', { room, id })
    console.log(allRooms)
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
    socket.emit('isJoined', { isValidRoom, id })
    console.log(allRooms)
  })

  // leaving a room
  socket.on('leave', ({ roomID, socketID }) => {
    Object.keys(allRooms).forEach(key => {
      if (key === roomID) {
        allRooms[roomID].forEach((obj, index) => {
          if (obj.id === socketID) {
            allRooms[roomID].splice(index, 1)
          }
        })
      }
    })
    console.log(allRooms)
  })

  // get all users in specific room
  socket.on('getUsers', (roomID) => {
    Object.keys(allRooms).forEach(key => {
      if (key === roomID) {
        socket.emit('roomUsers', allRooms[key])
      }
    })
  })

  // when user disconnects
  socket.on('disconnect', () => {
    console.log('the user is disconnected')
  })
})

console.log('Listening on 8888')
server.listen(8888)