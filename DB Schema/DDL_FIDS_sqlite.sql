PRAGMA foreign_keys = ON;
-- =============================
-- Table: Airports
-- Stores airport information including location and status.
-- Author: Lee
-- Date Created: 2025-04-11
-- Last Modified: 2025-04-11
-- =============================
CREATE TABLE Airports (
    AirportCode TEXT NOT NULL PRIMARY KEY,
    AirportName TEXT NOT NULL,
    City TEXT,
    Country TEXT,
    UseYn TEXT NOT NULL CHECK (UseYn IN ('Y', 'N')),
    UNIQUE (AirportName, City, Country) -- Avoid duplicate airports
);

-- =============================
-- Table: Airlines
-- Stores airline information including status.
-- Author: Lee
-- Date Created: 2025-04-11
-- Last Modified: 2025-04-11
-- =============================
CREATE TABLE Airlines (
    AirlineCode TEXT NOT NULL PRIMARY KEY,
    AirlineName TEXT NOT NULL,
    UseYn TEXT NOT NULL CHECK (UseYn IN ('Y', 'N')),
    UNIQUE (AirlineName) -- Avoid duplicate airline names
);

-- =============================
-- Table: Remarks
-- Stores remark codes and descriptions for flight status.
-- Author: Lee
-- Date Created: 2025-04-11
-- Last Modified: 2025-04-11
-- =============================
CREATE TABLE Remarks (
    RemarkCode TEXT NOT NULL PRIMARY KEY,
    RemarkName TEXT NOT NULL,
    UseYn TEXT NOT NULL CHECK (UseYn IN ('Y', 'N')),
    UNIQUE (RemarkName) -- Avoid duplicate remarks
);

-- =============================
-- Table: Roles
-- Stores system user roles.
-- Author: Lee
-- Date Created: 2025-04-11
-- Last Modified: 2025-04-11
-- =============================
CREATE TABLE Roles (
    RoleID TEXT NOT NULL PRIMARY KEY,
    RoleName TEXT NOT NULL,
    UNIQUE (RoleName) -- Avoid duplicate role names
);

-- =============================
-- Table: Users
-- Stores user information including linked airline and airport.
-- Author: Lee
-- Date Created: 2025-04-11
-- Last Modified: 2025-04-11
-- =============================
CREATE TABLE Users (
    UserID TEXT NOT NULL PRIMARY KEY,
    UserName TEXT NOT NULL,
    Password TEXT NOT NULL, -- Should be SHA-256 hash
    AirportCode TEXT,
    AirlineCode TEXT,
    FOREIGN KEY (AirportCode) REFERENCES Airports(AirportCode),
    FOREIGN KEY (AirlineCode) REFERENCES Airlines(AirlineCode)
);

-- =============================
-- Table: UserRoles
-- Assigns roles to users (many-to-many relationship).
-- Author: Lee
-- Date Created: 2025-04-11
-- Last Modified: 2025-04-11
-- =============================
CREATE TABLE UserRoles (
    UserRoleID TEXT NOT NULL PRIMARY KEY,
    UserID TEXT NOT NULL,
    RoleID TEXT NOT NULL,
    UNIQUE (UserID, RoleID), -- Prevent duplicate role assignments
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);

-- =============================
-- Table: ActiveFlightSchedules
-- Stores active flight schedules, including timing, locations, and remarks.
-- Author: Lee
-- Date Created: 2025-04-11
-- Last Modified: 2025-04-11
-- =============================
CREATE TABLE ActiveFlightSchedules (
    FlightId INTEGER PRIMARY KEY AUTOINCREMENT,
    FlightNumber TEXT NOT NULL,
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
