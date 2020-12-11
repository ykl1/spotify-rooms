const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const http = require('http')

const cors = require('cors')
const cookieParser = require('cookie-parser')
const oauth = require('./public/routes/oauth')

const RoomStorage = require('./public/routes/roomStorage')

const app = express()
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spotify-rooms'
const server = http.createServer(app)
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
})

require('./socket')(io)

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser())

app.use(oauth)

app.use(express.static('dist'))
app.use(express.json())

app.use('/roomStorage', RoomStorage)

// error handler middleware
app.use((err, req, res) => {
  res.status(500).send(`${err}`)
})

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

console.log('Listening on 8888')
server.listen(8888)