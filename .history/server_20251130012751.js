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
    console.log("Connected to the database");
  }
});

// Test Route
app.get("/", (req, res) => {
  res.send("Hello World! Server is running.");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
