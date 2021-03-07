const functions = require("firebase-functions");
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');

var serviceAccount = require('./admin.json');

admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
databaseURL: "https://deltahacks-d105e-default-rtdb.firebaseio.com/",
authDomain: "deltahacks-d105e.firebaseapp.com",
});

// CONSTANTS
const cors = require('cors');
const express = require('express');
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

var db=admin.database();


//Helper functions
const login = (username,password, res) => {
  const userRef = db.ref(`users/${username}`);
  userRef.once('value', snapshot => {
    if (snapshot.exists()){
      const {salt, password: saltedPassword } = snapshot.val();
      //salt password and check hash if it equates
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          res.status(500).json({"msg": "Something went wrong", "error": "OOPS"});
        }else {
          if (hash === saltedPassword) {
            res.json({"msg": "Success"});
          }else {
            res.status(400).json({"msg": "Incorrect password", "error": "AUTH_FAILED"})
          }
        }
      });
      
    }else {
      res.status(404).json({"msg": "Could not find username", "error": "NOT FOUND"});
    }
  })
};

const signUp = (username,password,res) => {
  const userRef = db.ref(`users/${username}`);
  userRef.once('value', snapshot => {
    if (snapshot.exists()){
      res.status(400).json({"msg": "Could user name already taken", "error": "AUTH_FAILED"});
    }else {
      bcrypt.genSalt(5,(err,salt) => {
        if (err) {
          res.status(500).json({"msg": "Something went wrong.", "error": "OOPS"});
        } else {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
              res.status(500).json({"msg": "Something went wrong.", "error": "OOPS"});
            } else {
              userRef.set({
                password: hash,
                salt
              }, (err) => {
                if (err) {
                  res.status(500).json({"msg": "Something went wrong.", "error": "OOPS"});
                }else {
                  db.ref(`points/${username}`).set(0)
                  res.json({"msg": "Sucessfully created user"});
                }
              })
            }
          });
        }
      })
    }
  });
  
}



//END POINTS
app.get('/login', (req,res) => {
  const { username, password } = req.query;
  if (!username || !password) {
    res.status(400).json({"msg": "Something went wrong", "error": "Missing required query params"});
  }
  login(username,password,res);
})

app.post('/signup', (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({"msg": "Something went wrong", "error": "Missing required body params"});
  }else {
    signUp(username, password, res);
  }
});

//End points schema
// signup - create User, accepts username, password, stores salt and password
// login - find a user and check if passwords match
// grab history - optional date for finding specific days
// update history - current data
// integrate with IOT device
// 

//db schema:
/* users: {
  username: {
    password-salted:
    salt:
  }
  points {
    username: ###
  }
  history: {
    username: {
      date: [
      {
        type: ENUM,
        data needed tracked
      }
      ]
    }
  }
  integrations: {
    username: {
      name: {type: ENUM, key: string}
    }
  }
}
*/

// // Create and Deploy Your First Cloud Functions


exports.app = functions.https.onRequest(app)
