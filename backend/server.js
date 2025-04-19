const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 9999;

app.use(cors());
app.use(express.json());

// ✅ Serve static images (like airline logos)
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ✅ Connect to SQLite database
const db = new sqlite3.Database("./FIDS.db", (err) => {
  if (err) console.error("SQLite connection error:", err);
  else console.log("✅ Connected to SQLite");
});

// ✅ Enable foreign key support
db.run(`PRAGMA foreign_keys = ON`);

// ✅ Create Users table
db.run(`
  CREATE TABLE IF NOT EXISTS Users (
    UserID TEXT PRIMARY KEY,
    UserName TEXT NOT NULL,
    Password TEXT NOT NULL,
    AirlineCode TEXT,
    FOREIGN KEY (AirlineCode) REFERENCES Airlines(AirlineCode)
  )
`);

// ✅ Create ActiveFlightSchedules table
db.run(`
  CREATE TABLE IF NOT EXISTS ActiveFlightSchedules (
    FlightId INTEGER PRIMARY KEY AUTOINCREMENT,
    FlightNumber TEXT,
    AirportCode TEXT NOT NULL,
    AirlineCode TEXT NOT NULL,
    FlightType CHAR(1) CHECK (FlightType IN ('A', 'D'))
    ScheduledDate TEXT NOT NULL,
    ScheduledTime TEXT NOT NULL,
    EstimatedDate TEXT,
    EstimatedTime TEXT,
    OriginDestAirport TEXT NOT NULL,
    Remarks TEXT,
    FOREIGN KEY (AirportCode) REFERENCES Airports(AirportCode),
    FOREIGN KEY (AirlineCode) REFERENCES Airlines(AirlineCode),
    FOREIGN KEY (OriginDestAirport) REFERENCES Airports(AirportCode),
    FOREIGN KEY (Remarks) REFERENCES Remarks(RemarkCode)
  )
`);

// ✅ Get all active flights with joined info
app.get("/api/flights", (req, res) => {
  const sql = `
    SELECT 
      af.FlightId, 
      af.FlightNumber, 
      af.ScheduledDate, 
      af.ScheduledTime,
      af.EstimatedDate, 
      af.EstimatedTime, 
      af.AirportCode, 
      dep.AirportName AS DepartureAirport,
      af.OriginDestAirport, 
      arr.AirportName AS ArrivalAirport,
      af.AirlineCode, 
      al.AirlineName,
      al.LogoPath,                  
      af.Remarks, 
      r.RemarkName
    FROM ActiveFlightSchedules af
    LEFT JOIN Airports dep ON af.AirportCode = dep.AirportCode
    LEFT JOIN Airports arr ON af.OriginDestAirport = arr.AirportCode
    LEFT JOIN Airlines al ON af.AirlineCode = al.AirlineCode
    LEFT JOIN Remarks r ON af.Remarks = r.RemarkCode
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ✅ Add a new flight
app.post("/api/flights", (req, res) => {
  const {
    FlightNumber, AirportCode, AirlineCode,
    ScheduledDate, ScheduledTime,
    EstimatedDate, EstimatedTime,
    OriginDestAirport, Remarks
  } = req.body;

  const sql = `
    INSERT INTO ActiveFlightSchedules
    (FlightNumber, AirportCode, AirlineCode, ScheduledDate, ScheduledTime,
     EstimatedDate, EstimatedTime, OriginDestAirport, Remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    FlightNumber, AirportCode, AirlineCode, ScheduledDate, ScheduledTime,
    EstimatedDate, EstimatedTime, OriginDestAirport, Remarks
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// ✅ Delete a flight by ID
app.delete("/api/flights/:id", (req, res) => {
  db.run("DELETE FROM ActiveFlightSchedules WHERE FlightId = ?", req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "✅ Flight deleted" });
  });
});

// ✅ Get airline list for combo box
app.get("/api/airlines", (req, res) => {
  const sql = `SELECT AirlineCode, AirlineName FROM Airlines ORDER BY AirlineName ASC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ✅ User signup
app.post("/api/users", (req, res) => {
  const { userID, userName, password, airlineCode } = req.body;

  if (!userID || !userName || !password) {
    return res.status(400).json({ error: "User ID, Name, and Password are required." });
  }

  const sql = `
    INSERT INTO Users (UserID, UserName, Password, AirlineCode)
    VALUES (?, ?, ?, ?)
  `;
  const params = [userID, userName, password, airlineCode || null];

  db.run(sql, params, function (err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(409).json({ error: "User ID already exists." });
      }
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: "✅ User registered successfully." });
  });
});

// ✅ User login
app.post("/api/login", (req, res) => {
  const { userID, password } = req.body;

  if (!userID || !password) {
    return res.status(400).json({ error: "User ID and password are required." });
  }

  const sql = `SELECT UserID, UserName, Password, AirlineCode FROM Users WHERE UserID = ?`;
  db.get(sql, [userID], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Database error." });
    }

    if (!row || row.Password !== password) {
      return res.status(401).json({ error: "Invalid User ID or password." });
    }

    res.json({
      message: "✅ Login successful.",
      user: {
        userID: row.UserID,
        userName: row.UserName,
        airlineCode: row.AirlineCode
      }
    });
  });
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
