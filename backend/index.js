require("dotenv").config();
const db = require("./db");
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ensure submissions file exists
const submissionsPath = path.join(__dirname, "submissions.json");
if (!fs.existsSync(submissionsPath)) {
  fs.writeFileSync(submissionsPath, "[]");
}

// Submit puzzle endpoint
app.post("/api/submit-puzzle", (req, res) => {
  try {
    const { submitter, groups } = req.body;

    if (!submitter || !groups || groups.length !== 4) {
      return res.status(400).json({ error: "Invalid submission format" });
    }

    const stmt = db.prepare(`
      INSERT INTO submissions (submitter, groups)
      VALUES (?, ?)
    `);

    stmt.run(submitter, JSON.stringify(groups));

    res.json({ success: true, message: "Puzzle submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save submission" });
  }
});

// Get all submissions
app.get("/api/submissions", (req, res) => {
  try {
    const stmt = db.prepare(
      "SELECT * FROM submissions ORDER BY submitted_at DESC",
    );
    const submissions = stmt.all();
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Submissions will be saved to: ${submissionsPath}`);
});
