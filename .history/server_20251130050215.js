const express = require("express");
const cors = require("cors");
var mysql = require("mysql");

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

// --- ROUTES ---

// 1. Get User Info
app.post("/getUserInfo", (req, res) => {
  const { userId, password } = req.body;
  const getUserInfosql = `SELECT userId, userName, userImage FROM users WHERE users.userId = ? AND users.userPassword = ?`;

  db.query(getUserInfosql, [userId, password], (err, result) => {
    if (err) {
      console.log("Error getting user info: ", err);
      res.status(500).send(err);
    } else {
      res.send(result);
    }
  });
});

// 2. Get All Posts
app.get("/getAllPosts", (req, res) => {
  const sqlForAllPosts = `SELECT posts.postId, users.userName AS postedUserName, users.userImage AS postedUserImage, posts.postedTime, posts.postText, posts.postImageUrl FROM posts INNER JOIN users ON posts.postedUserId=users.userId ORDER BY posts.postedTime DESC`;

  db.query(sqlForAllPosts, (err, result) => {
    if (err) {
      console.log("Error loading posts: ", err);
      res.status(500).send(err);
    } else {
      res.send(result);
    }
  });
});

// 3. Get Comments of a Single Post
app.get("/getAllComments/:postId", (req, res) => {
  let id = req.params.postId;
  let sqlForAllComments = `SELECT users.userName AS commentedUserName, users.userImage AS commentedUserImage, comments.commentId, comments.commentOfPostId, comments.commentText, comments.commentTime 
  FROM comments 
  INNER JOIN users ON comments.commentedUserId=users.userId WHERE comments.commentOfPostId = ?`;

  db.query(sqlForAllComments, [id], (err, result) => {
    if (err) {
      console.log("Error fetching comments: ", err);
      res.status(500).send(err);
    } else {
      res.send(result);
    }
  });
});

// 4. Add a Comment
app.post("/addComment", (req, res) => {
  const { commentOfPostId, commentedUserId, commentText, commentTime } =
    req.body;

  const addCommentSql = `INSERT INTO comments (commentOfPostId, commentedUserId, commentText, commentTime) VALUES (?, ?, ?, ?)`;

  db.query(
    addCommentSql,
    [commentOfPostId, commentedUserId, commentText, commentTime],
    (err, result) => {
      if (err) {
        console.log("Error adding comment: ", err);
        res.status(500).send(err);
      } else {
        res.send(result);
      }
    }
  );
});

// 5. Add a New Post (NEW FEATURE)
app.post("/addNewPost", (req, res) => {
  // Destructure data sent from frontend
  const { postedUserId, postedTime, postText, postImageUrl } = req.body;

  const addNewPostSql = `INSERT INTO posts (postedUserId, postedTime, postText, postImageUrl) VALUES (?, ?, ?, ?)`;

  db.query(
    addNewPostSql,
    [postedUserId, postedTime, postText, postImageUrl],
    (err, result) => {
      if (err) {
        console.log("Error adding new post: ", err);
        res.status(500).send(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
