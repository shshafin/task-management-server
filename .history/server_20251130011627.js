const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const port = 5000;

// Test Route
app.get("/", (req, res) => {
  res.send("Hello World! Server is running.");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
