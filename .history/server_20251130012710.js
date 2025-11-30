const express = require("express");
const cors = require("cors");
var mysql = require("mysql");

// middlewares
const app = express();
app.use(cors());
app.use(express.json());

const port = 5000;

var connection = mysql.createConnection({
  host: "localhost",
  user: "me",
  password: "secret",
  database: "postbook",
});

// Test Route
app.get("/", (req, res) => {
  res.send("Hello World! Server is running.");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
