PRAGMA foreign_keys = ON;

-- =============================
-- Table: Airports
-- Stores airport information including location and status.
-- =============================
CREATE TABLE Airports (
    -- Primary key representing the airport code.
    AirportCode TEXT NOT NULL PRIMARY KEY,

    -- Name of the airport along with its IATA code.
    AirportName TEXT NOT NULL,

    -- Name of the city where the airport is located.
    City TEXT,

    -- Name of the country where the airport is located.
    Country TEXT,

    -- Indicates whether the record is active. ('Y' for Yes, 'N' for No)
    UseYn TEXT NOT NULL DEFAULT 'Y'
);

-- =============================
-- Table: Airlines
-- Stores airline information including status.
-- =============================
CREATE TABLE Airlines (
    -- Primary key representing the airline code.
    AirlineCode TEXT NOT NULL PRIMARY KEY,

    -- Name of the airline along with its IATA code.
    AirlineName TEXT NOT NULL,
	
    -- Path for the airline logo image
	LogoPath TEXT,
	
   -- Indicates whether the record is active. ('Y' for Yes, 'N' for No)
	UseYn TEXT NOT NULL DEFAULT 'Y'

);

-- =============================
-- Table: Remarks
-- Stores remark codes and descriptions for flight status.
-- =============================
CREATE TABLE Remarks (
    -- Primary key representing the remark code.
    RemarkCode TEXT NOT NULL PRIMARY KEY,

    -- Description of the current flight status (e.g., Progressing, Delayed).
    RemarkName TEXT NOT NULL,

    -- Indicates whether the record is active. ('Y' for Yes, 'N' for No)
    UseYn TEXT NOT NULL DEFAULT 'Y'
);

-- =============================
-- Table: Roles
-- Stores system user roles.
-- =============================
CREATE TABLE Roles (
    -- Primary key representing the role ID.
    RoleID TEXT NOT NULL PRIMARY KEY,

    -- Name of the role used to identify the role within the system.
    RoleName TEXT NOT NULL
);

-- =============================
-- Table: Users
-- Stores user information including linked airline and airport.
-- =============================
CREATE TABLE Users (
    -- Primary key representing the user ID.
    UserID TEXT NOT NULL PRIMARY KEY,

    -- Name used to identify the user within the system.
    UserName TEXT NOT NULL,

    -- User password stored securely as a hash (e.g., SHA-256).
    Password TEXT NOT NULL,

    -- Foreign key referencing the Airports table.
    AirportCode TEXT,

    -- Foreign key referencing the Airlines table.
    AirlineCode TEXT,

    FOREIGN KEY (AirportCode) REFERENCES Airports(AirportCode),
    FOREIGN KEY (AirlineCode) REFERENCES Airlines(AirlineCode)
);

-- =============================
-- Table: UserRoles
-- Assigns roles to users (many-to-many relationship).
-- =============================
CREATE TABLE UserRoles (
    -- Primary key representing the UserRole ID.
    UserRoleID TEXT NOT NULL PRIMARY KEY,

    -- Foreign key referencing the Users table.
    UserID TEXT NOT NULL,

    -- Foreign key referencing the Roles table.
    RoleID TEXT NOT NULL,

    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);

-- =============================
-- Table: ActiveFlightSchedules
-- Stores active flight schedules, including timing, locations, and remarks.
-- =============================
CREATE TABLE ActiveFlightSchedules (
    -- Primary key uniquely identifying each active flight schedule.
    -- This is an auto-incrementing sequential numeric value.
    FlightId INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Numeric part of the flight number, e.g., '1234'.
    -- Used in combination with AirlineCode to form the full flight number (e.g., 'AA1234').
    FlightNumber TEXT,

    -- Flight Type A stands for 'Arrival', D stands for 'Departure'
    FlightType TEXT CHECK (FlightType IN ('A', 'D'))

ㄹ    -- Foreign key referencing Airports table, representing the airport code.
    AirportCode TEXT NOT NULL,

    -- Foreign key referencing Airlines table, representing the airline code.
    AirlineCode TEXT NOT NULL,

    -- Scheduled date of the flight in YYYYMMDD format (e.g., 20250411).
    ScheduledDate TEXT NOT NULL,

    -- Scheduled time of the flight in 24-hour HHmm format (e.g., 1530 for 3:30 PM).
    ScheduledTime TEXT NOT NULL,

    -- Estimated date of the flight in YYYYMMDD format (optional).
    EstimatedDate TEXT,

    -- Estimated time of the flight in HHmm format (optional).
    EstimatedTime TEXT,

    -- Foreign key referencing Airports table, representing the opposite airport code (origin or destination).
    OriginDestAirport TEXT NOT NULL,

    -- Foreign key referencing Remarks table, representing the remark code.
    Remarks TEXT,

    FOREIGN KEY (AirportCode) REFERENCES Airports(AirportCode),
    FOREIGN KEY (AirlineCode) REFERENCES Airlines(AirlineCode),
    FOREIGN KEY (OriginDestAirport) REFERENCES Airports(AirportCode),
    FOREIGN KEY (Remarks) REFERENCES Remarks(RemarkCode)
);


