-- Airports
INSERT INTO Airports (AirportCode, AirportName, City, Country, UseYn) VALUES
('JFK', 'John F. Kennedy International Airport', 'New York', 'USA', 'Y'),
('LAX', 'Los Angeles International Airport', 'Los Angeles', 'USA', 'Y'),
('ICN', 'Incheon International Airport', 'Seoul', 'South Korea', 'Y');

-- Airlines
INSERT INTO Airlines (AirlineCode, AirlineName, UseYn) VALUES
('AA', 'American Airlines', 'Y'),
('DL', 'Delta Air Lines', 'Y'),
('KE', 'Korean Air', 'Y');

-- Remarks
INSERT INTO Remarks (RemarkCode, RemarkName, UseYn) VALUES
('PRG', 'Progressing', 'Y'),
('BRD', 'Boarding', 'Y'),
('DPT', 'Departed', 'Y'),
('ARR', 'Arrived', 'Y'),
('DLT', 'Delayed', 'Y'),
('CNL', 'Cancelled', 'Y');

-- Roles
INSERT INTO Roles (RoleID, RoleName) VALUES
('ADMIN', 'Administrator'),
('OPS', 'Operations Manager'),
('VIEWER', 'Viewer');

-- Users
INSERT INTO Users (UserID, UserName, Password, AirportCode, AirlineCode) VALUES
('user01', 'Alice Johnson', '5e884898da28047151d0e56f8dc62927', 'JFK', 'AA'),
('user02', 'Bob Smith', '6cb75f652a9b52798eb6cf2201057c73', 'LAX', 'DL'),
('user03', 'Charlie Kim', '2b3a8d0a34e3e237c54b4cf2d80a3c41', 'ICN', 'KE');

-- UserRoles
INSERT INTO UserRoles (UserRoleID, UserID, RoleID) VALUES
('UR01', 'user01', 'ADMIN'),
('UR02', 'user02', 'OPS'),
('UR03', 'user03', 'VIEWER');

-- ActiveFlightSchedules (using today's date: 20250418)
INSERT INTO ActiveFlightSchedules (FlightNumber, AirportCode, AirlineCode, ScheduledDate, ScheduledTime, EstimatedDate, EstimatedTime, OriginDestAirport, Remarks) VALUES
('1001', 'JFK', 'AA', '20250418', '0800', '20250418', '0815', 'LAX', 'PRG'),
('2020', 'LAX', 'DL', '20250418', '0930', '20250418', '0945', 'ICN', 'BRD'),
('3050', 'ICN', 'KE', '20250418', '2200', '20250418', '2230', 'JFK', 'DPT');
