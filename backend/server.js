const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 9999;

app.use(cors());
app.use(express.json());

// Connect to SQLite Database
const db = new sqlite3.Database("./database.db", (err) => {
    if (err) console.error("SQLite connection error:", err);
    else console.log("Connected to SQLite");
});

// Ensure Foreign Keys are ON
db.run(`PRAGMA foreign_keys = ON`);

// Create ActiveFlightSchedules Table (For dev/testing only)
// You can comment this out if the table already exists from your DDL
db.run(`
  CREATE TABLE IF NOT EXISTS ActiveFlightSchedules (
    FlightId INTEGER PRIMARY KEY AUTOINCREMENT,
    FlightNumber TEXT,
    AirportCode TEXT NOT NULL,
    AirlineCode TEXT NOT NULL,
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

// API: Get all active flights (optionally include JOIN info)
app.get("/api/flights", (req, res) => {
    const sql = `
        SELECT af.FlightId, af.FlightNumber, af.ScheduledDate, af.ScheduledTime,
               af.EstimatedDate, af.EstimatedTime, af.AirportCode, dep.AirportName AS DepartureAirport,
               af.OriginDestAirport, arr.AirportName AS ArrivalAirport,
               af.AirlineCode, al.AirlineName,
               af.Remarks, r.RemarkName
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

// API: Add a flight
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

// API: Delete a flight
app.delete("/api/flights/:id", (req, res) => {
    db.run("DELETE FROM ActiveFlightSchedules WHERE FlightId = ?", req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Flight deleted" });
    });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
