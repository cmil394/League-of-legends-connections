const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;

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

    const submission = {
      submitter,
      groups: groups.map((group) => ({
        name: group.category,
        words: group.words,
      })),
      submittedAt: new Date().toISOString(),
    };
    const submissions = JSON.parse(fs.readFileSync(submissionsPath, "utf8"));
    submissions.push(submission);

    fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2));

    console.log(`New puzzle submitted by ${submitter}`);
    res.json({ success: true, message: "Puzzle submitted successfully" });
  } catch (error) {
    console.error("Error saving submission:", error);
    res.status(500).json({ error: "Failed to save submission" });
  }
});

// Get all submissions
app.get("/api/submissions", (req, res) => {
  try {
    const submissions = JSON.parse(fs.readFileSync(submissionsPath, "utf8"));
    res.json(submissions);
  } catch (error) {
    console.error("Error reading submissions:", error);
    res.status(500).json({ error: "Failed to read submissions" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Submissions will be saved to: ${submissionsPath}`);
});
