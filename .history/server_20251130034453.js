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
  // Added posts.postId to the SELECT list
  const sqlForAllPosts = `SELECT posts.postId, users.userName AS postedUserName, users.userImage AS postedUserImage, posts.postedTime, posts.postText, posts.postImageUrl FROM posts INNER JOIN users ON posts.postedUserId=users.userId ORDER BY posts.postedTime DESC`;

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

//getting comments of a single post
app.get("/getAllComments/:postId", (req, res) => {
  let id = req.params.postId;

  let sqlForAllComments = `SELECT users.userName AS commentedUserName, users.userImage AS commentedUserImage, comments.commentId, comments.commentOfPostId, comments.commentText, comments.commentTime 
FROM comments 
INNER JOIN users ON comments.commentedUserId=users.userId WHERE comments.commentOfPostId = ${id}`;

  let query = db.query(sqlForAllComments, (err, result) => {
    if (err) {
      console.log("Error fetching comments from the database: ", err);
      throw err;
    } else {
      res.send(result);
    }
  });
});

// adding a comment to a post
app.post("/addComment", (req, res) => {
  const { commentOfPostId, commentedUserId, commentText, commentTime } = req.body;

// Test Route
app.get("/", (req, res) => {
  res.send("Hello World! Server is running.");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
