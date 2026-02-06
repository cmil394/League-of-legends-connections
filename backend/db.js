const Database = require("better-sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "submissions.db");

const db = new Database(dbPath);

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submitter TEXT NOT NULL,
    groups TEXT NOT NULL,
    submitted_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`,
).run();

module.exports = db;
