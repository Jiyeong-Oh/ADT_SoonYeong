
PRAGMA foreign_keys = ON;

-- ==================== TABLE DEFINITIONS ====================

CREATE TABLE IF NOT EXISTS Airports (
  AirportCode TEXT NOT NULL PRIMARY KEY,
  AirportName TEXT NOT NULL,
  City TEXT,
  Country TEXT,
  UseYn TEXT NOT NULL DEFAULT 'Y'
);

CREATE TABLE IF NOT EXISTS Airlines (
  AirlineCode TEXT NOT NULL PRIMARY KEY,
  AirlineName TEXT NOT NULL,
  LogoPath TEXT,
  UseYn TEXT NOT NULL DEFAULT 'Y'
);

CREATE TABLE IF NOT EXISTS Remarks (
  RemarkCode TEXT NOT NULL PRIMARY KEY,
  RemarkName TEXT NOT NULL,
  UseYn TEXT NOT NULL DEFAULT 'Y'
);

CREATE TABLE IF NOT EXISTS Roles (
  RoleID TEXT NOT NULL PRIMARY KEY,
  RoleName TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Users (
  UserID TEXT NOT NULL PRIMARY KEY,
  UserName TEXT NOT NULL,
  Password TEXT NOT NULL,
  AirportCode TEXT,
  AirlineCode TEXT,
  FOREIGN KEY (AirportCode) REFERENCES Airports(AirportCode),
  FOREIGN KEY (AirlineCode) REFERENCES Airlines(AirlineCode)
);

CREATE TABLE IF NOT EXISTS UserRoles (
  UserRoleID TEXT NOT NULL PRIMARY KEY,
  UserID TEXT NOT NULL,
  RoleID TEXT NOT NULL,
  FOREIGN KEY (UserID) REFERENCES Users(UserID),
  FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);

CREATE TABLE IF NOT EXISTS ActiveFlightSchedules (
  FlightId INTEGER PRIMARY KEY AUTOINCREMENT,
  FlightNumber TEXT,
  FlightType TEXT CHECK (FlightType IN ('A', 'D')),
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
);

-- ==================== FLIGHT SCHEDULE ====================

SELECT 
  af.FlightId, af.FlightNumber, af.ScheduledDate, af.ScheduledTime,
  af.EstimatedDate, af.EstimatedTime, af.OriginDestAirport, ap.AirportName,
  af.AirlineCode, al.AirlineName, af.FlightType, al.LogoPath,
  af.Remarks, r.RemarkName
FROM ActiveFlightSchedules af
LEFT JOIN Airports ap ON af.OriginDestAirport = ap.AirportCode
LEFT JOIN Airlines al ON af.AirlineCode = al.AirlineCode
LEFT JOIN Remarks r ON af.Remarks = r.RemarkCode
WHERE af.AirlineCode = ?
  AND (af.AirportCode = ? OR af.OriginDestAirport = ?)
  AND af.FlightNumber LIKE ?
  AND af.ScheduledDate = ?;

INSERT INTO ActiveFlightSchedules
(FlightNumber, AirportCode, AirlineCode, FlightType, ScheduledDate, ScheduledTime,
 EstimatedDate, EstimatedTime, OriginDestAirport, Remarks)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

UPDATE ActiveFlightSchedules SET
  FlightNumber = ?, AirportCode = ?, AirlineCode = ?,
  FlightType = ?, ScheduledDate = ?, ScheduledTime = ?,
  EstimatedDate = ?, EstimatedTime = ?,
  OriginDestAirport = ?, Remarks = ?
WHERE FlightId = ?;

DELETE FROM ActiveFlightSchedules WHERE FlightId = ?;

-- ==================== AIRPORT ====================

SELECT AirportCode, AirportName, City, Country, UseYn
FROM Airports
ORDER BY AirportName ASC;

SELECT AirportCode, AirportName, City, Country, UseYn
FROM Airports
WHERE AirportCode LIKE ?
  AND AirportName LIKE ?
  AND City LIKE ?
  AND Country LIKE ?
  AND UseYn = ?;

INSERT INTO Airports (AirportCode, AirportName, City, Country, UseYn)
VALUES (?, ?, ?, ?, ?);

UPDATE Airports
SET AirportName = ?, City = ?, Country = ?, UseYn = ?
WHERE AirportCode = ?;

DELETE FROM Airports WHERE AirportCode = ?;

-- ==================== AIRLINE ====================

SELECT AirlineCode, AirlineName, LogoPath, UseYn
FROM Airlines
ORDER BY AirlineName ASC;

SELECT AirlineCode, AirlineName, LogoPath, UseYn
FROM Airlines
WHERE AirlineCode LIKE ?
  AND AirlineName LIKE ?
  AND LogoPath LIKE ?
  AND UseYn = ?;

INSERT INTO Airlines (AirlineCode, AirlineName, LogoPath, UseYn)
VALUES (?, ?, ?, ?);

UPDATE Airlines
SET AirlineName = ?, LogoPath = ?, UseYn = ?
WHERE AirlineCode = ?;

DELETE FROM Airlines WHERE AirlineCode = ?;

-- ==================== REMARK ====================

SELECT RemarkCode, RemarkName, UseYn
FROM Remarks
ORDER BY RemarkName ASC;

SELECT RemarkCode, RemarkName, UseYn
FROM Remarks
WHERE RemarkCode LIKE ?
  AND RemarkName LIKE ?
  AND UseYn = ?;

INSERT INTO Remarks (RemarkCode, RemarkName, UseYn)
VALUES (?, ?, ?);

UPDATE Remarks
SET RemarkName = ?, UseYn = ?
WHERE RemarkCode = ?;

DELETE FROM Remarks WHERE RemarkCode = ?;

-- ==================== ROLE ====================

SELECT RoleID, RoleName FROM Roles ORDER BY RoleID ASC;

SELECT RoleID, RoleName FROM Roles
WHERE RoleID LIKE ?
  AND RoleName LIKE ?;

INSERT INTO Roles (RoleID, RoleName)
VALUES (?, ?);

UPDATE Roles
SET RoleName = ?
WHERE RoleID = ?;

DELETE FROM Roles WHERE RoleID = ?;

-- ==================== USER ====================

SELECT UserID, UserName, Password, AirlineCode, AirportCode
FROM Users
ORDER BY UserID ASC;

SELECT UserID, UserName, Password, AirlineCode, AirportCode
FROM Users
WHERE UserID LIKE ?
  AND UserName LIKE ?
  AND Password LIKE ?
  AND AirlineCode LIKE ?
  AND AirportCode LIKE ?;

INSERT INTO Users (UserID, UserName, Password, AirlineCode)
VALUES (?, ?, ?, ?);

UPDATE Users
SET UserName = ?, Password = ?, AirlineCode = ?, AirportCode = ?
WHERE UserID = ?;

DELETE FROM Users WHERE UserID = ?;

-- Login
SELECT UserID, UserName, Password, AirlineCode
FROM Users
WHERE UserID = ?;

-- ==================== USER ROLES ====================

SELECT UserRoleID, UserID, RoleID
FROM UserRoles
ORDER BY UserRoleID ASC;

SELECT UserRoleID, UserID, RoleID
FROM UserRoles
WHERE UserRoleID LIKE ?
  AND UserID LIKE ?
  AND RoleID LIKE ?;

INSERT INTO UserRoles (UserRoleID, UserID, RoleID)
VALUES (?, ?, ?);

UPDATE UserRoles
SET UserID = ?, RoleID = ?
WHERE UserRoleID = ?;

DELETE FROM UserRoles WHERE UserRoleID = ?;
