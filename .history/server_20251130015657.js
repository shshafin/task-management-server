const express = require("express");
const cors = require("cors");

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

// Test Route
app.get("/", (req, res) => {
  res.send("Hello World! Server is running.");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
