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

app.get('/:path', async (req, res) => {
  let data = await db.getPlaylist("/" + req.params.path)
  res.send(data[0]);
})

app.listen(port, "::", () => {
  console.log(`Server is running on port ${port}`);
});