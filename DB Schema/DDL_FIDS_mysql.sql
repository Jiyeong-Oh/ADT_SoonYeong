

CREATE TABLE Airports (
    AirportCode CHAR(3) NOT NULL COMMENT 'Primary key representing the airport code.',
    AirportName VARCHAR(50) NOT NULL COMMENT 'Name of the airport along with its IATA code.',
    City VARCHAR(50) COMMENT 'Name of the city where the airport is located.',
    Country VARCHAR(50) COMMENT 'Name of the country where the airport is located.',
    UseYn CHAR(1) NOT NULL COMMENT 'Indicates whether the record is active. (''Y'' for Yes, ''N'' for No)',
    PRIMARY KEY (AirportCode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Stores airport information including location and status.';


CREATE TABLE Airlines (
    AirlineCode CHAR(2) NOT NULL COMMENT 'Primary key representing the airline code.',
    AirlineName VARCHAR(50) NOT NULL COMMENT 'Name of the airline along with its IATA code.',
    UseYn CHAR(1) NOT NULL COMMENT 'Indicates whether the record is active. (''Y'' for Yes, ''N'' for No)',
    PRIMARY KEY (AirlineCode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Stores airline information including status.';

CREATE TABLE Remarks (
    RemarkCode CHAR(3) NOT NULL COMMENT 'Primary key representing the remark code.',
    RemarkName VARCHAR(50) NOT NULL COMMENT 'Description of the current flight status (e.g., Progressing, Delayed).',
    UseYn CHAR(1) NOT NULL COMMENT 'Indicates whether the record is active. (''Y'' for Yes, ''N'' for No)',
    PRIMARY KEY (RemarkCode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Stores remark codes and descriptions for flight status.';


CREATE TABLE Roles (
    RoleID VARCHAR(20) NOT NULL COMMENT 'Primary key representing the role ID.',
    RoleName VARCHAR(50) NOT NULL COMMENT 'Name of the role used to identify the role within the system.',
    PRIMARY KEY (RoleID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Stores system user roles.';


CREATE TABLE Users (
    UserID VARCHAR(20) NOT NULL COMMENT 'Primary key representing the user ID.',
    UserName VARCHAR(50) NOT NULL COMMENT 'Name used to identify the user within the system.',
    Password VARCHAR(64) NOT NULL COMMENT 'User password stored as a hash (e.g., SHA-256).',
    AirportCode CHAR(3) COMMENT 'Foreign key referencing the Airports table.',
    AirlineCode CHAR(2) COMMENT 'Foreign key referencing the Airlines table.',
    PRIMARY KEY (UserID),
    FOREIGN KEY (AirportCode) REFERENCES Airports(AirportCode),
    FOREIGN KEY (AirlineCode) REFERENCES Airlines(AirlineCode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Stores user information including linked airport and airline.';



CREATE TABLE UserRoles (
    UserRoleID VARCHAR(20) NOT NULL COMMENT 'Primary key representing the UserRole ID.',
    UserID VARCHAR(20) NOT NULL COMMENT 'Foreign key referencing the Users table.',
    RoleID VARCHAR(20) NOT NULL COMMENT 'Foreign key referencing the Roles table.',
    PRIMARY KEY (UserRoleID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Assigns roles to users (many-to-many relationship).';

CREATE TABLE ActiveFlightSchedules (
    FlightId INT NOT NULL AUTO_INCREMENT COMMENT 'Primary key uniquely identifying each active flight schedule. Auto-incrementing sequential numeric value.',
    FlightNumber VARCHAR(12) COMMENT 'Numeric part of the flight number, e.g., "1234". Used with AirlineCode to form full flight number (e.g., "AA1234").',
    AirportCode CHAR(3) NOT NULL COMMENT 'Foreign key referencing Airports table, representing the airport code.',
    AirlineCode CHAR(2) NOT NULL COMMENT 'Foreign key referencing Airlines table, representing the airline code.',
    ScheduledDate VARCHAR(8) NOT NULL COMMENT 'Scheduled date of the flight in YYYYMMDD format (e.g., 20250411).',
    ScheduledTime VARCHAR(4) NOT NULL COMMENT 'Scheduled time of the flight in 24-hour HHmm format (e.g., 1530 for 3:30 PM).',
    EstimatedDate VARCHAR(8) COMMENT 'Estimated date of the flight in YYYYMMDD format (optional).',
    EstimatedTime VARCHAR(4) COMMENT 'Estimated time of the flight in 24-hour HHmm format (optional).',
    OriginDestAirport CHAR(3) NOT NULL COMMENT 'Foreign key referencing Airports table, representing the opposite airport code (origin or destination).',
    Remarks CHAR(3) COMMENT 'Foreign key referencing Remarks table, representing the remark code.',
    PRIMARY KEY (FlightId),
    FOREIGN KEY (AirportCode) REFERENCES Airports(AirportCode),
    FOREIGN KEY (AirlineCode) REFERENCES Airlines(AirlineCode),
    FOREIGN KEY (OriginDestAirport) REFERENCES Airports(AirportCode),
    FOREIGN KEY (Remarks) REFERENCES Remarks(RemarkCode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Stores active flight schedules, including timing, locations, and remarks.';
