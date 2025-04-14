-- =============================
-- Sample Data: Airports
-- Author: Jiyeong Oh
-- Date Created: 2025-04-11
-- Last Modified: 2025-04-11
-- =============================
INSERT INTO Airports (AirportCode, AirportName, City, Country, UseYn) VALUES
('JFK', 'John F. Kennedy International Airport', 'New York', 'USA', 'Y'),
('LAX', 'Los Angeles International Airport', 'Los Angeles', 'USA', 'Y'),
('ICN', 'Incheon International Airport', 'Seoul', 'South Korea', 'Y');

-- =============================
-- Sample Data: Airlines
-- Author: Jiyeong Oh
-- Date Created: 2025-04-11
-- Last Modified: 2025-04-11
-- =============================
INSERT INTO Airlines (AirlineCode, AirlineName, UseYn) VALUES
('AA', 'American Airlines', 'Y'),
('DL', 'Delta Air Lines', 'Y'),
('KE', 'Korean Air', 'Y');

-- =============================
-- Sample Data: Remarks
-- Author: Jiyeong Oh
-- Date Created: 2025-04-11
-- Last Modified: 2025-04-11
-- =============================
INSERT INTO Remarks (RemarkCode, RemarkName, UseYn) VALUES
('PRG', 'Progressing', 'Y'),
('BRD', 'Boarding', 'Y'),
('DPT', 'Departed', 'Y'),
('ARR', 'Arrived', 'Y'),
('DLT', 'Delayed', 'Y'),
('CNL', 'Cancelled', 'Y');


-- =============================
-- Sample Data: Roles
-- Author: Jiyeong Oh
-- Date Created: 2025-04-11
-- Last Modified: 2025-04-11
-- =============================
INSERT INTO Roles (RoleID, RoleName) VALUES
('ADMIN', 'Administrator'),
('OPS', 'Operations Manager'),
('VIEWER', 'Viewer');

-- =============================
-- Sample Data: Users
-- Passwords are hashed (use SHA-256 or better in production!)
-- Here simple text for demonstration
-- Author: Jiyeong Oh
-- Date Created: 2025-04-11
-- Last Modified: 2025-04-11
-- =============================
INSERT INTO Users (UserID, UserName, Password, AirportCode, AirlineCode) VALUES
('user01', 'Alice Johnson', '5e884898da28047151d0e56f8dc62927', 'JFK', 'AA'),
('user02', 'Bob Smith', '6cb75f652a9b52798eb6cf2201057c73', 'LAX', 'DL'),
('user03', 'Charlie Kim', '2b3a8d0a34e3e237c54b4cf2d80a3c41', 'ICN', 'KE');

-- =============================
-- Sample Data: UserRoles
-- Author: Jiyeong Oh
-- Date Created: 2025-04-11
-- Last Modified: 2025-04-11
-- =============================
INSERT INTO UserRoles (UserRoleID, UserID, RoleID) VALUES
('UR01', 'user01', 'ADMIN'),
('UR02', 'user02', 'OPS'),
('UR03', 'user03', 'VIEWER');

-- =============================
-- Sample Data: ActiveFlightSchedules
-- Author: Jiyeong Oh
-- Date Created: 2025-04-11
-- Last Modified: 2025-04-11
-- =============================
INSERT INTO ActiveFlightSchedules (FlightNumber, AirportCode, AirlineCode, ScheduledDate, ScheduledTime, EstimatedDate, EstimatedTime, OriginDestAirport, Remarks) VALUES
('1001', 'JFK', 'AA', '20250415', '0800', '20250415', '0815', 'LAX', 'PRG'),
('2020', 'LAX', 'DL', '20250416', '0930', '20250416', '0945', 'ICN', 'BRD'),
('3050', 'ICN', 'KE', '20250417', '2200', '20250417', '2230', 'JFK', 'DPT');
