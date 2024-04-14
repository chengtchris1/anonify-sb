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
app.use(express.static(path.join(__dirname, '../dist')));
app.get('/playlist', (req, res, next) => {
  db.getPlaylist(req.query.path)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      next(err);
    });
})

app.get('/:path', async (req, res) => {
  let data = await db.getPlaylist("/" + req.params.path)
  res.send(data[0]);
})


app.post('/', async (req, res) => {
  let data;
  try {
    data = await db.addPlaylist(req.body.path, req.body.playlistName, req.body.songLimit)
  } catch (err) {
    console.log(err);
    res.send(err);
  }
  res.send(data);
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});