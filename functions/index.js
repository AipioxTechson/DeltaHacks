const functions = require("firebase-functions");

const cors = require('cors');
const express = require('express');
const PORT = 3000;

const app = express();

app.use(cors());

app.get('/hello', (req,res) => {
  res.send("hello there");
})

app.listen(PORT, () => {
  console.log('Server is listening on PORT', PORT);
});

// // Create and Deploy Your First Cloud Functions


exports.app = functions.https.onRequest(app)
