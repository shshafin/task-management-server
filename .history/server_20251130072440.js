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

// Check if User is Logged In
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // We expect header: "Bearer 1" (where 1 is user ID)
  const userId = authHeader && authHeader.split(" ")[1];

  if (!userId) {
    console.log("❌ Access Denied: No User ID provided");
    return res.status(401).json({ error: "Please login first" });
  }

  req.userId = userId; // Attach ID to the request
  next(); // Continue to the next step
};

// --- ROUTES ---

// REGISTER (Sign Up)
app.post("/register", async (req, res) => {
  console.log("📝 Register request received:", req.body);
  try {
    const { username, email, password } = req.body;

    // Simple SQL Insert
    const sql =
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    await pool.execute(sql, [username, email, password]);

    console.log("✅ User registered:", username);
    res.json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("❌ Registration Error:", err.message);
    res.status(500).json({ error: "Email already exists or Database error" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  console.log("🔑 Login attempt:", req.body);
  try {
    const { email, password } = req.body;

    // 1. Get user by email
    const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      console.log("❌ User not found");
      return res.status(400).json({ error: "User not found" });
    }

    const user = users[0];

    // 2. Compare passwords (Plain text for simplicity)
    if (password === user.password) {
      console.log("✅ Login successful for:", user.username);
      // Send back the User ID and Username
      res.json({ token: user.id, username: user.username });
    } else {
      console.log("❌ Wrong password");
      res.status(401).json({ error: "Invalid password" });
    }
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET TASKS (Protected)
app.get("/tasks", authenticateUser, async (req, res) => {
  try {
    const [tasks] = await pool.execute(
      "SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Error fetching tasks" });
  }
});

// CREATE TASK (Protected)
app.post("/tasks", authenticateUser, async (req, res) => {
  console.log("📌 Creating task for User ID:", req.userId);
  try {
    const { title, description } = req.body;

    const sql =
      "INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)";
    await pool.execute(sql, [req.userId, title, description]);

    res.json({ message: "Task created" });
  } catch (err) {
    console.error("❌ Create Task Error:", err.message);
    res.status(500).json({ error: "Error creating task" });
  }
});

// DELETE TASK (Protected)
app.delete("/tasks/:id", authenticateUser, async (req, res) => {
  try {
    await pool.execute("DELETE FROM tasks WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.userId,
    ]);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting task" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
