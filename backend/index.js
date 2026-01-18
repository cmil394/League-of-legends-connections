const express = require("express");
const app = express();
const PORT = 8000;

// Middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Node.js backend!");
});

app.listen(PORT, () => {
  console.log("Hello");
});
