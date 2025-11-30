const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

const port = 5000;

// DATABASE CONNECTION
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "task-management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Auth Middleware
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const userId = authHeader && authHeader.split(" ")[1];

  if (!userId) {
    console.log("❌ Access Denied: No User ID provided");
    return res.status(401).json({ error: "Please login first" });
  }

  req.userId = userId;
  next();
};

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
