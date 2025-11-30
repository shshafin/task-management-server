const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise"); 

const app = express();
app.use(cors());
app.use(express.json());

const port = 5000;

// 1. DATABASE CONNECTION
// Make sure XAMPP is running and you created the database 'task-management'
const pool = mysql.createPool({
  host: "localhost",
  user: "root",      
  password: "",      // Default XAMPP password is empty
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

// --- ROUTES ---

// REGISTER (Sign Up)
app.post("/register", async (req, res) => {
  console.log("📝 Register request received:", req.body);
  try {
    const { username, email, password } = req.body;
    
    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
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
    
    const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    
    if (users.length === 0) {
      console.log("❌ User not found");
      return res.status(400).json({ error: "User not found" });
    }
    
    const user = users[0];

    // Compare passwords
    if (password === user.password) {
      console.log("✅ Login successful for:", user.username);
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

// GET TASKS 
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

// CREATE TASK 
app.post("/tasks", authenticateUser, async (req, res) => {
  console.log("📌 Creating task for User ID:", req.userId);
  try {
    const { title, description } = req.body;
    
    const sql = "INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)";
    await pool.execute(sql, [req.userId, title, description]);
    
    res.json({ message: "Task created" });
  } catch (err) {
    console.error("❌ Create Task Error:", err.message);
    res.status(500).json({ error: "Error creating task" });
  }
});

// UPDATE TASK 
app.put("/tasks/:id", authenticateUser, async (req, res) => {
  try {
    const { title, description } = req.body;
    await pool.execute(
      "UPDATE tasks SET title = ?, description = ? WHERE id = ? AND user_id = ?",
      [title, description, req.params.id, req.userId]
    );
    res.json({ message: "Task updated" });
  } catch (err) {
    res.status(500).json({ error: "Error updating task" });
  }
});

// DELETE TASK 
app.delete("/tasks/:id", authenticateUser, async (req, res) => {
    try {
      await pool.execute(
        "DELETE FROM tasks WHERE id = ? AND user_id = ?",
        [req.params.id, req.userId]
      );
      res.json({ message: "Task deleted" });
    } catch (err) {
      res.status(500).json({ error: "Error deleting task" });
    }
  });

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});