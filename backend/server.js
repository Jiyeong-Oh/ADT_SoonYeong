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
    FlightType CHAR(1) CHECK (FlightType IN ('A', 'D')),
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

// ✅ Get all active flights with filters
app.get("/api/flights", (req, res) => {
  const { airline, airport, flightNumber, date } = req.query;
  let whereClauses = [];
  let params = [];

  if (airline) {
    whereClauses.push("af.AirlineCode = ?");
    params.push(airline);
  }

  if (airport) {
    whereClauses.push("(af.AirportCode = ? OR af.OriginDestAirport = ?)");
    params.push(airport, airport);
  }

  if (flightNumber) {
    whereClauses.push("af.FlightNumber LIKE ?");
    params.push(`%${flightNumber}%`);
  }

  if (date) {
    const formattedDate = date.replace(/-/g, "");
    whereClauses.push("af.ScheduledDate = ?");
    params.push(formattedDate);
  }

  let sql = `
    SELECT 
      af.FlightId, 
      af.FlightNumber, 
      af.ScheduledDate, 
      af.ScheduledTime,
      af.EstimatedDate, 
      af.EstimatedTime, 
      af.OriginDestAirport, 
      ap.AirportName,
      af.AirlineCode, 
      al.AirlineName,
      af.FlightType,
      al.LogoPath,                  
      af.Remarks, 
      r.RemarkName
    FROM ActiveFlightSchedules af
    LEFT JOIN Airports ap ON af.OriginDestAirport = ap.AirportCode
    LEFT JOIN Airlines al ON af.AirlineCode = al.AirlineCode
    LEFT JOIN Remarks r ON af.Remarks = r.RemarkCode
  `;

  if (whereClauses.length > 0) {
    sql += " WHERE " + whereClauses.join(" AND ");
  }

  db.all(sql, params, (err, rows) => {
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

// ✅ Get airport list for combo box
app.get("/api/airports", (req, res) => {
  const sql = `SELECT AirportCode, AirportName, City, Country, UseYn FROM Airports ORDER BY AirportName ASC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ✅ Get all airports with filters
app.get("/api/airports_filter", (req, res) => {
  const { code, name, city, country, yn } = req.query;
  let whereClauses = [];
  let params = [];

  if (code?.trim()) {
    whereClauses.push("AirportCode LIKE ?");
    params.push(`%${code.trim()}%`);
  }

  if (name?.trim()) {
    whereClauses.push("AirportName LIKE ?");
    params.push(`%${name.trim()}%`);
  }

  if (city?.trim()) {
    whereClauses.push("City LIKE ?");
    params.push(`%${city.trim()}%`);
  }

  if (country?.trim()) {
    whereClauses.push("Country LIKE ?");
    params.push(`%${country.trim()}%`);
  }

  if (yn?.trim()) {
    whereClauses.push("UseYn = ?");
    params.push(yn.trim());
  }

  let sql = `
    SELECT 
      AirportCode,
      AirportName,
      City,
      Country,
      UseYn
    FROM Airports
  `;

  if (whereClauses.length > 0) {
    sql += " WHERE " + whereClauses.join(" AND ");
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
    
  });
});

// ✅ Create Airports
app.post("/api/airports", (req, res) => {
  const { AirportCode, AirportName, City, Country, UseYn } = req.body;

  if (!AirportCode || !AirportName) {
    return res.status(400).json({ error: "AirportCode and AirportName are required." });
  }

  const sql = `
    INSERT INTO Airports (AirportCode, AirportName, City, Country, UseYn)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    AirportCode,
    AirportName,
    City || null,
    Country || null,
    UseYn || 'Y'
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "✅ Airport added successfully.", id: this.lastID });
  });
});

// ✅ Update Airports
app.put("/api/airports/:code", (req, res) => {
  const { AirportName, City, Country, UseYn } = req.body;
  const AirportCode = req.params.code;

  const sql = `
    UPDATE Airports 
    SET AirportName = ?, City = ?, Country = ?, UseYn = ? 
    WHERE AirportCode = ?
  `;
  const params = [AirportName, City, Country, UseYn, AirportCode];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: "Airport not found." });
    }
    res.json({ message: "✅ Airport updated successfully." });
  });
});

// ✅ Delete Airports
app.delete("/api/airports/:code", (req, res) => {
  const AirportCode = req.params.code;

  db.run("DELETE FROM Airports WHERE AirportCode = ?", AirportCode, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: "Airport not found." });
    }
    res.json({ message: "✅ Airport deleted successfully." });
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