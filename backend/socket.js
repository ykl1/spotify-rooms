module.exports = io => {
  const allRooms = {}

  io.on('connection', (socket) => {
    // when user is connected
    console.log('a user is connected')
    const id = socket.id

    // display the queue of songs in the front end. 
    socket.on('queueDisplay', ({ uri, name, albumArt, roomID, isHost, artist }) => {
      if (isHost) {
        socket.emit('queueDisplay', { uri, name, albumArt, artist })
      } else {
        Object.keys(allRooms).forEach(key => {
          if (key === roomID) {
            allRooms[roomID].forEach(obj => {
              if (obj.host) {
                socket.to(obj.id).emit('queueDisplay', { uri, name, albumArt, artist })
              }
            })
          }
        })
      }
    })

    // queues song from member room to the host id
    socket.on('queueFromMember', ({ uri, roomID }) => {
      Object.keys(allRooms).forEach(key => {
        if (key === roomID) {
          allRooms[roomID].forEach(obj => {
            if (obj.host) {
              socket.to(obj.id).emit('queueToHost', uri)
            }
          })
        }
      })
    })

    // sends display queue to all members within same room. 
    socket.on('queueToMember', ({ roomID, currentQueue }) => {
      Object.keys(allRooms).forEach(key => {
        if (key === roomID) {
          allRooms[roomID].forEach(obj => {
            socket.to(obj.id).emit('currentQueue', currentQueue)
          })
        }
      })
    })
    
    // sends the host's info to all room members. 
    socket.on('currentUserInfo', ({ is_playing, uri, progress_ms, roomID, name, albumArt }) => {
      Object.keys(allRooms).forEach(key => {
        if (key === roomID) {
          allRooms[roomID].forEach(obj => {
            socket.to(obj.id).emit('hostInfo', { is_playing, uri, progress_ms, name, albumArt })
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
      let isEmpty = false
      userInfo.id = id
      Object.keys(allRooms).forEach(key => {
        if (key === roomID) {
          isValidRoom = true
          if (allRooms[key].length === 0) {
            userInfo.host = true
            isEmpty = true
          }
          allRooms[key].push(userInfo)
        }
      })
      socket.emit('isJoined', { isValidRoom, id, isEmpty, userInfo, roomID })
      console.log(allRooms)
    })

    // host leaves a room
    socket.on('hostLeave', ({ roomID }) => {
      Object.keys(allRooms).forEach(key => {
        if (key === roomID) {
          allRooms[roomID].forEach((obj) => {
            allRooms[roomID] = []
            socket.to(obj.id).emit('hostLeft', 'hi')
          })
        }
      })
      console.log(allRooms)
    })

    // member (non host) leaving a room
    socket.on('memberLeave', ({ roomID, socketID }) => {
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

    // when user disconnects
    socket.on('disconnect', () => {
      console.log('the user is disconnected')
    })
  })
}