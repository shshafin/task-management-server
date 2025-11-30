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
  const sqlForAllPosts = `SELECT posts.postId, posts.postedUserId, users.userName AS postedUserName, users.userImage AS postedUserImage, posts.postedTime, posts.postText, posts.postImageUrl FROM posts INNER JOIN users ON posts.postedUserId=users.userId ORDER BY posts.postedTime DESC`;

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

// 5. Add a New Post
app.post("/addNewPost", (req, res) => {
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

// 6. DELETE POST (New)
app.delete("/deletePost/:postId", (req, res) => {
  const postId = req.params.postId;

  // Step 1: Delete comments associated with the post first (to prevent Foreign Key errors)
  const deleteCommentsSql = "DELETE FROM comments WHERE commentOfPostId = ?";

  db.query(deleteCommentsSql, [postId], (err, result) => {
    if (err) {
      console.log("Error deleting associated comments: ", err);
      res.status(500).send(err);
    } else {
      // Step 2: Now delete the actual post
      const deletePostSql = "DELETE FROM posts WHERE postId = ?";
      db.query(deletePostSql, [postId], (err, result) => {
        if (err) {
          console.log("Error deleting post: ", err);
          res.status(500).send(err);
        } else {
          res.send({ message: "Post deleted successfully" });
        }
      });
    }
  });
});

// 7. UPDATE POST (New)
app.put("/updatePost", (req, res) => {
  const { postId, postText, postImageUrl } = req.body;

  const updateSql =
    "UPDATE posts SET postText = ?, postImageUrl = ? WHERE postId = ?";

  db.query(updateSql, [postText, postImageUrl, postId], (err, result) => {
    if (err) {
      console.log("Error updating post:", err);
      res.status(500).send(err);
    } else {
      res.send({ message: "Post updated successfully" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
