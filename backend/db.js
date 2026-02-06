const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "submissions.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("SQLite connection error:", err);
  else console.log("Connected to SQLite database");
});

db.run(`
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submitter TEXT NOT NULL,
  group1 TEXT NOT NULL,
  group2 TEXT NOT NULL,
  group3 TEXT NOT NULL,
  group4 TEXT NOT NULL,
  submittedAt TEXT NOT NULL
)
`);

module.exports = db;
