const functions = require("firebase-functions");
const admin = require('firebase-admin');

var serviceAccount = require('./admin.json');

admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
databaseURL: "https://deltahacks-d105e-default-rtdb.firebaseio.com/",
authDomain: "deltahacks-d105e.firebaseapp.com",
});

// CONSTANTS
const cors = require('cors');
const express = require('express');

const app = express();

app.use(cors());

var db=admin.database();

var userRef=db.ref("users");

//Helper functions
const getUsers = (res) => {
  return userRef.once('value',(snap) => {
    res.status(200).json({"users":snap.val()})
    });
};

const createUser = (res) => {
  userRef.push({
    id:22,
    name:"Jane Doe",
    email:"jane@doe.com",
    website:"https://jane.foo.bar"
  }, (err) => {
    if (err) {
      console.log(err);
      res.status(300).json({"msg":"Something went wrong","error":err});
    } else {
      res.status(200).json({"msg":"user created sucessfully"});
    }
  })
}



//END POINTS
app.get('/hello', (req,res) => {
  console.log("Hello!");
  getUsers(res);
})

app.post('/createUser', (req,res) => {
  createUser(res);
});

// // Create and Deploy Your First Cloud Functions


exports.app = functions.https.onRequest(app)
