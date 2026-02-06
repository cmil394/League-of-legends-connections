const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Submit puzzle
app.post("/api/submit-puzzle", (req, res) => {
  const { submitter, groups } = req.body;

  if (!submitter || !groups || groups.length !== 4) {
    return res.status(400).json({ error: "Invalid submission format" });
  }

  const stmt = db.prepare(
    `INSERT INTO submissions (submitter, group1, group2, group3, group4, submittedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );

  try {
    stmt.run(
      submitter,
      JSON.stringify(groups[0]),
      JSON.stringify(groups[1]),
      JSON.stringify(groups[2]),
      JSON.stringify(groups[3]),
      new Date().toISOString(),
    );

    res.json({ success: true, message: "Puzzle submitted successfully" });
  } catch (err) {
    console.error("SQLite insert error:", err);
    res.status(500).json({ error: "Failed to save submission" });
  }
});

// Get all submissions
app.get("/api/submissions", (req, res) => {
  db.all("SELECT * FROM submissions", [], (err, rows) => {
    if (err) {
      console.error("SQLite fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch submissions" });
    }
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
