const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const port = process.env.PORT || 3000;
const app = express();
const db = require('../db/models.cjs');
const qs = require('qs');
const fs = require('fs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './../dist')));

let bearerToken = '';
let tokenFetchTime = null;
let authData = qs.stringify({
  grant_type: 'client_credentials',
  client_id: process.env.spotify_client_id,
  client_secret: process.env.spotify_secret
});

app.get('/auth', (req, res, next) => {
  const currentTime = new Date()
  if (bearerToken !== '' && currentTime - tokenFetchTime < 60 * 60 * 1000) {
    return res.send(bearerToken);
  }
  axios.post('https://accounts.spotify.com/api/token', authData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then((response) => {
    //console.log(JSON.stringify(response.data));
    //res.status(200).send(response.data);
    bearerToken = response.data.access_token;
    tokenFetchTime = new Date()
    res.send(response.data.access_token);
  })
    .catch((err) => { next(err) });
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  //userToken = code;
  console.log('code', code)
  let response;
  try {
    response = await axios.post('https://accounts.spotify.com/api/token', qs.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.callback_uri,
      client_id: process.env.spotify_client_id,
      client_secret: process.env.spotify_secret,
    }));
  } catch (err) {
    console.log(err)
    console.log('error with getting token after cb')
    res.end();
  }
  let accessToken;
  let userInfo;
  let userId;
  accessToken = response.data.access_token;
  try {
    userInfo = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    userId = userInfo.data.id;
    console.log('userId', userId);
  } catch (err) {
    console.log('error with userinfo')
    res.end();
  }

  //Originally, the user was redirected to the original path, but redirecting to the playlist instead.
  //const originalPath = decodeURIComponent(req.query.state);
  // Exchange the code for an access token...
  // Then redirect the user to the original path

  const regex = /[^/]*$/
  const path = req.query.state.match(regex)[0]

  let data = await db.getPlaylist(('/' + path))
  console.log(data)
  data = data[0]
  const trackIds = data.tracks.map(track => track.track_id)
  console.log(trackIds)
  const playlistResponse = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    name: data.name || 'Untitled Playlist'
  }, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const playlistId = playlistResponse.data.id;
  try {
    await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      uris: trackIds.map(id => `spotify:track:${id}`)
    }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  } catch (err) {
    console.log(err.response.data)
  }
  //console.log(playlistResponse.data);
  res.redirect(playlistResponse.data.external_urls.spotify)
  // res.redirect(originalPath);
});



app.patch('/:songIndex/upvote', (req, res, next) => {
  db.upvoteTrack(req.params.songIndex)
    .then((data) => {
      res.send(String(data));
    })
    .catch((err) => {
      console.log('Error upvoting track', err);
    });
})

app.patch('/:songIndex/downvote', (req, res, next) => {
  db.downvoteTrack(req.params.songIndex)
    .then((data) => {
      if (data.status === 204) {
        console.log('Successfully downvoted track');
      } else {
        throw new Error('Failed to downvote track');
      }
    })
    .catch((err) => {
      console.log('Error downvoting track', err);
    });
  res.end();
})

app.patch('/:path/:songId/:index', (req, res, next) => {
  //Delete the song from the playlist
  db.deleteTrack(req.params.index, req.params.songId)
    .then((data) => {
      console.log('Deleted song', data);
      res.send(data[0]);
    })
    .catch((err) => {
      console.log('Deleted song but error', err, res);
    })
    .finally(() => {
      res.end();
    });
})

app.get('/playlist', (req, res, next) => {
  console.log(req.query)
  db.getPlaylist(req.query.path)
    .then((data) => {
      console.log(req.query.path);
      res.status(200).send(data[0]);
    })
    .catch((err) => {
      if (!res.headersSent) {
        next(err)
      }
    });
})

app.get('/:id', (req, res, next) => {
  res.sendFile(path.join(__dirname, './../dist/index.html'));
})

app.put('/:id', async (req, res, next) => {
  //updateOne the playlist with the path of the id
  //Add the track id to the playlist field
  //req.params.id

  //call spotify api to check if the track id is valid
  //if valid, add to the playlist
  //if not valid, return an error
  axios.get(`https://api.spotify.com/v1/tracks/${req.body.trackId}`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`
    }
  }).then((response) => {
    console.log(response.data);
    db.addTrack('/' + req.params.id, req.body.trackId)
      .then((data) => {
        res.status(201).send(data.data[0]);
      })
      .catch((err) => {
        res.status(500).send('Failed to add song to db');
      })
  }).catch((err) => {
    console.log(err);
    res.status(400)
    res.send('Invalid track id / Track id not found on Spotify');
  });



})

app.post('/', (req, res) => {
  //console.log(req.body);
  db.addPlaylist(req.body.path, req.body.playlistName, req.body.songLimit)
    .then(() => {
      res.status(201).send('Success');
    })
    .catch((err) => {
      console.log(err)
      res.status(400).send('Error');
    });
})

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Error!');
});

app.listen(port, "::", () => {
  console.log(`Server is running on port ${port}`);
  console.log(port)
});