const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 9999;

app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "public/images")));

const db = new sqlite3.Database("./FIDS.db", (err) => {
  if (err) console.error("SQLite connection error:", err);
  else console.log("✅ Connected to SQLite");
});

db.run(`PRAGMA foreign_keys = ON`);

// ======= TABLES =======
db.run(`
  CREATE TABLE IF NOT EXISTS Users (
    UserID TEXT PRIMARY KEY,
    UserName TEXT NOT NULL,
    Password TEXT NOT NULL,
    AirlineCode TEXT,
    FOREIGN KEY (AirlineCode) REFERENCES Airlines(AirlineCode)
  )
`);

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

// ======= FLIGHT ENDPOINTS =======

// Get all active flights with filters
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
      af.FlightId, af.FlightNumber, af.ScheduledDate, af.ScheduledTime,
      af.EstimatedDate, af.EstimatedTime, af.OriginDestAirport, ap.AirportName,
      af.AirlineCode, al.AirlineName, af.FlightType, al.LogoPath,                  
      af.Remarks, r.RemarkName
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

// Add a new flight
app.post("/api/flights", (req, res) => {
  const {
    FlightNumber, AirportCode, AirlineCode,
    FlightType,
    ScheduledDate, ScheduledTime,
    EstimatedDate, EstimatedTime,
    OriginDestAirport, Remarks
  } = req.body;

  const safeAirportCode = AirportCode?.trim() || "IND";

  const sql = `
    INSERT INTO ActiveFlightSchedules
    (FlightNumber, AirportCode, AirlineCode, FlightType, ScheduledDate, ScheduledTime,
     EstimatedDate, EstimatedTime, OriginDestAirport, Remarks)
    VALUES (?, ?,?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    FlightNumber, safeAirportCode, AirlineCode, FlightType, ScheduledDate, ScheduledTime,
    EstimatedDate || null, EstimatedTime || null, OriginDestAirport, Remarks
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Update a flight by ID
app.put("/api/flights/:id", (req, res) => {
  console.log("✈️ PUT /api/flights/:id", req.params.id);
  console.log("📝 Body:", req.body);

  const {
    FlightNumber, AirportCode, AirlineCode,
    FlightType, ScheduledDate, ScheduledTime,
    EstimatedDate, EstimatedTime,
    OriginDestAirport, Remarks
  } = req.body;

  const safeAirportCode = AirportCode?.trim() || "IND";

  const sql = `
    UPDATE ActiveFlightSchedules SET
      FlightNumber = ?, AirportCode = ?, AirlineCode = ?,
      FlightType = ?, ScheduledDate = ?, ScheduledTime = ?,
      EstimatedDate = ?, EstimatedTime = ?,
      OriginDestAirport = ?, Remarks = ?
    WHERE FlightId = ?
  `;

  const params = [
    FlightNumber, safeAirportCode, AirlineCode,
    FlightType, ScheduledDate, ScheduledTime,
    EstimatedDate || null, EstimatedTime || null,
    OriginDestAirport, Remarks, req.params.id
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error("❌ 500 error (flight update):", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Flight not found." });
    }

    res.json({ message: "✅ Flight updated successfully." });
  });
});

// Delete a flight by ID
app.delete("/api/flights/:id", (req, res) => {
  db.run("DELETE FROM ActiveFlightSchedules WHERE FlightId = ?", req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "✅ Flight deleted" });
  });
});

// ======= AIRPORTS =======

app.get("/api/airports", (req, res) => {
  const sql = `SELECT AirportCode, AirportName, City, Country, UseYn FROM Airports ORDER BY AirportName ASC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

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

  let sql = `SELECT AirportCode, AirportName, City, Country, UseYn FROM Airports`;
  if (whereClauses.length > 0) {
    sql += " WHERE " + whereClauses.join(" AND ");
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/airports", (req, res) => {
  const { AirportCode, AirportName, City, Country, UseYn } = req.body;

  if (!AirportCode || !AirportName) {
    return res.status(400).json({ error: "AirportCode and AirportName are required." });
  }

  const sql = `
    INSERT INTO Airports (AirportCode, AirportName, City, Country, UseYn)
    VALUES (?, ?, ?, ?, ?)
  `;

  const params = [AirportCode, AirportName, City || null, Country || null, UseYn || 'Y'];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "✅ Airport added successfully.", id: this.lastID });
  });
});

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

// ======= AIRLINES =======

app.get("/api/airlines", (req, res) => {
  const sql = `SELECT AirlineCode, AirlineName, LogoPath, UseYn FROM Airlines ORDER BY AirlineName ASC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/api/airlines_filter", (req, res) => {
  const { code, name, logopath, yn } = req.query;
  let whereClauses = [];
  let params = [];

  if (code?.trim()) {
    whereClauses.push("AirlineCode LIKE ?");
    params.push(`%${code.trim()}%`);
  }

  if (name?.trim()) {
    whereClauses.push("AirlineName LIKE ?");
    params.push(`%${name.trim()}%`);
  }

  if (logopath?.trim()) {
    whereClauses.push("LogoPath LIKE ?");
    params.push(`%${logopath.trim()}%`);
  }

  if (yn?.trim()) {
    whereClauses.push("UseYn = ?");
    params.push(yn.trim());
  }

  let sql = `SELECT AirlineCode, AirlineName, LogoPath, UseYn FROM Airlines`;
  if (whereClauses.length > 0) {
    sql += " WHERE " + whereClauses.join(" AND ");
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/airlines", (req, res) => {
  const { AirlineCode, AirlineName, LogoPath, UseYn } = req.body;

  if (!AirlineCode || !AirlineName) {
    return res.status(400).json({ error: "AirlineCode and AirlineName are required." });
  }

  const sql = `
    INSERT INTO Airlines (AirlineCode, AirlineName, LogoPath, UseYn)
    VALUES (?, ?, ?, ?)
  `;

  const params = [AirlineCode, AirlineName || null, LogoPath || null, UseYn || 'Y'];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "✅ Airline added successfully.", id: this.lastID });
  });
});

app.put("/api/airlines/:code", (req, res) => {
  const { AirlineName, LogoPath, UseYn } = req.body;
  const AirlineCode = req.params.code;

  const sql = `
    UPDATE Airlines 
    SET AirlineName = ?, LogoPath = ?, UseYn = ? 
    WHERE AirlineCode = ?
  `;
  const params = [AirlineName, LogoPath, UseYn, AirlineCode];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: "Airline not found." });
    }
    res.json({ message: "✅ Airline updated successfully." });
  });
});

app.delete("/api/airlines/:code", (req, res) => {
  const AirlineCode = req.params.code;

  db.run("DELETE FROM Airlines WHERE AirlineCode = ?", AirlineCode, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: "Airline not found." });
    }
    res.json({ message: "✅ Airline deleted successfully." });
  });
});

// ======= Remarks =======

app.get("/api/remarks", (req, res) => {
  const sql = `SELECT RemarkCode, RemarkName, UseYn FROM Remarks ORDER BY RemarkName ASC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/api/remarks_filter", (req, res) => {
  const { code, name, yn } = req.query;
  let whereClauses = [];
  let params = [];

  if (code?.trim()) {
    whereClauses.push("RemarkCode LIKE ?");
    params.push(`%${code.trim()}%`);
  }

  if (name?.trim()) {
    whereClauses.push("RemarkName LIKE ?");
    params.push(`%${name.trim()}%`);
  }

  if (yn?.trim()) {
    whereClauses.push("UseYn = ?");
    params.push(yn.trim());
  }

  let sql = `SELECT RemarkCode, RemarkName, UseYn FROM Remarks`;
  if (whereClauses.length > 0) {
    sql += " WHERE " + whereClauses.join(" AND ");
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/remarks", (req, res) => {
  const { RemarkCode, RemarkName, UseYn } = req.body;

  if (!RemarkCode || !RemarkName) {
    return res.status(400).json({ error: "RemarkCode and RemarkName are required." });
  }

  const sql = `
    INSERT INTO Remarks (RemarkCode, RemarkName, UseYn)
    VALUES (?, ?, ?)
  `;

  const params = [RemarkCode, RemarkName || null, UseYn || 'Y'];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "✅ Remark added successfully.", id: this.lastID });
  });
});

app.put("/api/remarks/:code", (req, res) => {
  const { RemarkName, UseYn } = req.body;
  const RemarkCode = req.params.code;

  const sql = `
    UPDATE Remarks 
    SET RemarkName = ?, UseYn = ? 
    WHERE RemarkCode = ?
  `;
  const params = [RemarkName, UseYn, RemarkCode];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: "Remark not found." });
    }
    res.json({ message: "✅ Remark updated successfully." });
  });
});

app.delete("/api/remarks/:code", (req, res) => {
  const RemarkCode = req.params.code;

  db.run("DELETE FROM Remarks WHERE RemarkCode = ?", RemarkCode, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: "Remark not found." });
    }
    res.json({ message: "✅ Remark deleted successfully." });
  });
});

// ======= ROLES =======

app.get("/api/roles", (req, res) => {
  const sql = `SELECT RoleID, RoleName FROM Roles ORDER BY RoleID ASC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/api/roles_filter", (req, res) => {
  const { code, name } = req.query;
  let whereClauses = [];
  let params = [];

  if (code?.trim()) {
    whereClauses.push("RoleID LIKE ?");
    params.push(`%${code.trim()}%`);
  }

  if (name?.trim()) {
    whereClauses.push("RoleName LIKE ?");
    params.push(`%${name.trim()}%`);
  }

  let sql = `SELECT RoleID, RoleName FROM Roles`;
  if (whereClauses.length > 0) {
    sql += " WHERE " + whereClauses.join(" AND ");
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/roles", (req, res) => {
  const { RoleID, RoleName } = req.body;

  if (!RoleID || !RoleName) {
    return res.status(400).json({ error: "RoleID and RoleName are required." });
  }

  const sql = `
    INSERT INTO Roles (RoleID, RoleName)
    VALUES (?, ?)
  `;

  const params = [RoleID, RoleName];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "✅ Role added successfully.", id: this.lastID });
  });
});

app.put("/api/roles/:code", (req, res) => {
  const { RoleName } = req.body;
  const RoleID = req.params.code;

  const sql = `
    UPDATE Roles 
    SET RoleName = ?
    WHERE RoleID = ?
  `;
  const params = [RoleName, RoleID];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: "Role not found." });
    }
    res.json({ message: "✅ Role updated successfully." });
  });
});

app.delete("/api/roles/:code", (req, res) => {
  const RoleID = req.params.code;

  db.run("DELETE FROM Roles WHERE RoleID = ?", RoleID, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: "Role not found." });
    }
    res.json({ message: "✅ Role deleted successfully." });
  });
});

// ======= USERS =======

// Post is only available through Login Page
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

app.get("/api/users", (req, res) => {
  const sql = `SELECT UserID, UserName, Password, AirlineCode, AirportCode
  FROM Users
  ORDER BY UserID ASC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


app.get("/api/users_filter", (req, res) => {
  const { code, name, password, airline, airport } = req.query;
  let whereClauses = [];
  let params = [];

  if (code?.trim()) {
    whereClauses.push("UserID LIKE ?");
    params.push(`%${code.trim()}%`);
  }

  if (name?.trim()) {
    whereClauses.push("UserName LIKE ?");
    params.push(`%${name.trim()}%`);
  }

  if (password?.trim()) {
    whereClauses.push("Password LIKE ?");
    params.push(`%${password.trim()}%`);
  }

  if (airline?.trim()) {
    whereClauses.push("AirlineCode LIKE ?");
    params.push(`%${airline.trim()}%`);
  }

  if (airport?.trim()) {
    whereClauses.push("AirportCode LIKE ?");
    params.push(`%${airport.trim()}%`);
  }

  let sql = `SELECT UserID, UserName, Password, AirlineCode, AirportCode FROM Users`;
  if (whereClauses.length > 0) {
    sql += " WHERE " + whereClauses.join(" AND ");
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put("/api/users/:code", (req, res) => {
  const { UserName, Password, AirlineCode, AirportCode } = req.body;
  const UserID = req.params.code;

  const sql = `
    UPDATE Users 
    SET UserName = ?, Password = ?, AirlineCode = ?, AirportCode = ?
    WHERE UserID = ?
  `;
  const params = [UserName, Password, AirlineCode, AirportCode, UserID];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ message: "✅ User updated successfully." });
  });
});


app.delete("/api/users/:code", (req, res) => {
  const UserID = req.params.code;

  db.run("DELETE FROM Users WHERE UserID = ?", UserID, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ message: "✅ User deleted successfully." });
  });
});


// ======= USER_Roles =======


app.post("/api/userroles", (req, res) => {
  const { UserRoleID, UserID, RoleID } = req.body;

  if (!UserRoleID || !UserID || !RoleID) {
    return res.status(400).json({ error: "UserRoleID, UserID and RoleID are required." });
  }

  const sql = `
    INSERT INTO UserRoles (UserRoleID, UserID, RoleID)
    VALUES (?, ?, ?)
  `;

  const params = [UserRoleID, UserID, RoleID];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "✅ UserRole added successfully.", id: this.lastID });
  });
});


app.get("/api/userroles", (req, res) => {
  const sql = `SELECT UserRoleID, UserID, RoleID
  FROM UserRoles
  ORDER BY UserRoleID ASC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


app.get("/api/userroles_filter", (req, res) => {
  const { userroleid, userid, roleid } = req.query;
  let whereClauses = [];
  let params = [];

  if (userroleid?.trim()) {
    whereClauses.push("UserRoleID LIKE ?");
    params.push(`%${userroleid.trim()}%`);
  }

  if (userid?.trim()) {
    whereClauses.push("UserID LIKE ?");
    params.push(`%${userid.trim()}%`);
  }

  if (roleid?.trim()) {
    whereClauses.push("RoleID LIKE ?");
    params.push(`%${roleid.trim()}%`);
  }

  let sql = `SELECT UserRoleID, UserID, RoleID FROM UserRoles`;
  if (whereClauses.length > 0) {
    sql += " WHERE " + whereClauses.join(" AND ");
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put("/api/userroles/:code", (req, res) => {
  const { UserID, RoleID } = req.body;
  const UserRoleID = req.params.code;

  const sql = `
    UPDATE UserRoles 
    SET UserID = ?, RoleID = ?
    WHERE UserRoleID = ?
  `;
  const params = [UserID, RoleID, UserRoleID];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: "User Role not found." });
    }
    res.json({ message: "✅ User Role updated successfully." });
  });
});


app.delete("/api/userroles/:code", (req, res) => {
  const UserRoleID = req.params.code;

  db.run("DELETE FROM UserRoles WHERE UserRoleID = ?", UserRoleID, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: "User Role not found." });
    }
    res.json({ message: "✅ User Role deleted successfully." });
  });
});

// ======= LOGINS =======

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

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
