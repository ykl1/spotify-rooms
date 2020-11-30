const express = require('express')
const router = express.Router()
const querystring = require('querystring')
const request = require('request') // "Request" library

const client_id = '94d9126429804a38b7155050aaa932cc' // Your client id
const client_secret = '73db521f228140b386340695adb088c6' // Your secret
const redirect_uri = 'http://localhost:8888/callback' // Your redirect uri

const generateRandomStr = (length) => {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
  
const stateKey = 'spotify_auth_state'

router.get('/login', (req, res) => {

    let state = generateRandomStr(16)
    res.cookie(stateKey, state)
  
    // your application requests authorization
    const scope = 'user-read-private user-read-email user-read-playback-state user-read-currently-playing user-modify-playback-state'
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }))
  })
  
router.get('/callback', (req, res) => {
  
  // your application requests refresh and access tokens
  // after checking the state parameter

  let code = req.query.code || null
  let state = req.query.state || null
  let storedState = req.cookies ? req.cookies[stateKey] : null

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }))
  } else {
    res.clearCookie(stateKey)
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    }

    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {

        let access_token = body.access_token,
            refresh_token = body.refresh_token;

        let options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        }

        // use the access token to access the Spotify Web API
        request.get(options, (error, response, body) => {
          console.log(body);
        })

        // we can also pass the token to the browser to make requests from there
        res.redirect('http://localhost:1234/RoomEntry/RoomEntry/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }))
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }))
      }
    })
  }
})

router.get('/refresh_token', (req, res) => {
  
  // requesting access token from refresh token
  let refresh_token = req.query.refresh_token
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  }

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      let access_token = body.access_token;
      res.send({
        'access_token': access_token
      })
    }
  })
})

module.exports = router
