const express = require("express");
const cors = require("cors");
var mysql = require("mysql");

// middlewares
const app = express();
app.use(cors());
app.use(express.json());

const port = 5000;

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "postbook",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database mysql");
  }
});

//getting user data from server

app.post("/getUserInfo", (req, res) => {
  const { userId, password } = req.body;

  const getUserInfosql = `SELECT userId, userName, userImage FROM users WHERE users.userId = ? AND users.userPassword = ?`;

  let query = db.query(getUserInfosql, [userId, password], (err, result) => {
    if (err) {
      console.log("Error getting user info from server: ", err);
      throw err;
    } else {
      res.send(result);
    }
  });
});

//getting all posts from server
app.get("/getAllPosts", (req, res) => {
  const sqlForAllPosts = `SELECT users.userName AS postedUserName, users.userImage AS postedUserImage, posts.postedTime, posts.postText, posts.postImageUrl FROM posts INNER JOIN users ON posts.postedUserId=users.userId ORDER BY posts.postedTime DESC`;

  let query = db.query(sqlForAllPosts, (err, result) => {
    if (err) {
      console.log("Error loading all posts from database: ", err);
      throw err;
    } else {
      console.log(result);
      res.send(result);
    }
  });
});

// Test Route
app.get("/", (req, res) => {
  res.send("Hello World! Server is running.");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
