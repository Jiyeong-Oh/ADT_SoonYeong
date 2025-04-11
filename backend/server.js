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

// Create Flights Table (Updated Schema)
db.run(`
  CREATE TABLE IF NOT EXISTS flights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sta TEXT,
    eta TEXT,
    airline TEXT,
    logo TEXT,
    flight_number TEXT,
    origin TEXT,
    remark TEXT
  )
`);

// API: Get Flights
app.get("/api/flights", (req, res) => {
    db.all("SELECT * FROM flights", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// API: Add Flight
app.post("/api/flights", (req, res) => {
    const { sta, eta, airline, logo, flight_number, origin, remark } = req.body;
    db.run(
        "INSERT INTO flights (sta, eta, airline, logo, flight_number, origin, remark) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [sta, eta, airline, logo, flight_number, origin, remark],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

// API: Delete Flight
app.delete("/api/flights/:id", (req, res) => {
    db.run("DELETE FROM flights WHERE id = ?", req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Flight deleted" });
    });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
