import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FlightScheduleMgt.css";

const UserMgtUserRole = () => {
  const [flights, setFlights] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [airports, setAirports] = useState([]);
  const [remarks, setRemarks] = useState([]);
  const [editedCells, setEditedCells] = useState(new Set());
  const [editedRows, setEditedRows] = useState(new Set());
  const [message, setMessage] = useState(null);

  const [search, setSearch] = useState({
    airline: "",
    airport: "",
    flightNumber: "",
    date: "",
  });

  useEffect(() => {
    fetchFlights();
    fetchAirlines();
    fetchAirports();
    fetchRemarks();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchFlights = () => {
    axios
      .get("http://localhost:9999/api/flights")
      .then((res) => {
        setFlights(res.data);
        setEditedRows(new Set());
        setEditedCells(new Set());
      })
      .catch((err) => console.error("❌ Error loading flights", err));
  };

  const fetchAirlines = () => {
    axios
      .get("http://localhost:9999/api/airlines")
      .then((res) => setAirlines(res.data))
      .catch((err) => console.error("❌ Error loading airlines", err));
  };

  const fetchAirports = () => {
    axios
      .get("http://localhost:9999/api/airports")
      .then((res) => setAirports(res.data))
      .catch((err) => console.error("❌ Error loading airports", err));
  };

  const fetchRemarks = () => {
    axios
      .get("http://localhost:9999/api/remarks")
      .then((res) => setRemarks(res.data))
      .catch((err) => console.error("❌ Error loading airlines", err));
  };

  const handleSearch = () => {
    axios
      .get("http://localhost:9999/api/flights", { params: search })
      .then((res) => {
        setFlights(res.data);
        setEditedRows(new Set());
        setEditedCells(new Set());
      })
      .catch((err) => console.error("❌ Search error", err));
  };

  const handleAddRow = () => {
    const newRow = {
      FlightNumber: "",
      ScheduledDate: "",
      ScheduledTime: "",
      EstimatedDate: "",
      EstimatedTime: "",
      AirportCode: "IND",
      OriginDestAirport: "",
      AirlineCode: "",
      Remarks: "ONTIME",
      FlightType: "A",
    };
    setFlights([...flights, newRow]);
  };

  const handleChange = (index, field, value) => {
    const updatedFlights = [...flights];
    updatedFlights[index][field] = value;

    const updatedCells = new Set(editedCells);
    updatedCells.add(`${index}-${field}`);
    setEditedCells(updatedCells);

    const updatedRows = new Set(editedRows);
    updatedRows.add(index);
    setEditedRows(updatedRows);

    setFlights(updatedFlights);
  };

  const handleCancel = (index) => {
    const updatedFlights = [...flights];
    if (updatedFlights[index].FlightId) {
      // revert to original data from server
      fetchFlights();
    } else {
      // remove new row
      updatedFlights.splice(index, 1);
      setFlights(updatedFlights);
    }
    const updatedRows = new Set(editedRows);
    updatedRows.delete(index);
    setEditedRows(updatedRows);
  };

  const handleSave = (flight, index) => {
    const flightData = {
      ...flight,
      AirportCode: flight.AirportCode || "IND",
      FlightType: flight.FlightType || "A",
    };

    const isUpdate = !!flight.FlightId;
    const url = isUpdate
      ? `http://localhost:9999/api/flights/${flight.FlightId}`
      : "http://localhost:9999/api/flights";

    const method = isUpdate ? axios.put : axios.post;

    method(url, flightData)
      .then(() => {
        setMessage({ type: "success", text: "✅ Flight saved successfully." });
        fetchFlights();
      })
      .catch((err) => {
        console.error("❌ Error saving flight:", err);
        setMessage({ type: "error", text: "❌ Failed to save flight." });
      });
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:9999/api/flights/${id}`)
      .then(() => {
        setMessage({ type: "success", text: "🗑️ Flight deleted successfully." });
        fetchFlights();
      })
      .catch((err) => {
        console.error("❌ Delete error", err);
        setMessage({ type: "error", text: "❌ Failed to delete flight." });
      });
  };

  // Helper to get display value for Flight column
  const getFlightDisplay = (flight) =>
    (flight.AirlineCode || "") + (flight.FlightNumber || "");

  return (
    <div className="flight-mgt-container">
      <div className="header-row">
        <h2>Flight Schedule Management</h2>
        <select
          value={search.airline}
          onChange={(e) => setSearch({ ...search, airline: e.target.value })}
        >
          <option value="">-- Airline --</option>
          {airlines.map((a) => (
            <option key={a.AirlineCode} value={a.AirlineCode}>
              {a.AirlineName}
            </option>
          ))}
        </select>
        <select
          value={search.airport}
          onChange={(e) => setSearch({ ...search, airport: e.target.value })}
        >
          <option value="">-- Airport --</option>
          {airports.map((a) => (
            <option key={a.AirportCode} value={a.AirportCode}>
              {a.AirportName}
            </option>
          ))}
        </select>
        <input
          className="search-input"
          placeholder="Flight Number"
          value={search.flightNumber}
          onChange={(e) =>
            setSearch({ ...search, flightNumber: e.target.value })
          }
        />
        <input
          type="date"
          className="search-input"
          value={search.date}
          onChange={(e) => setSearch({ ...search, date: e.target.value })}
        />
        <button className="btn" onClick={handleSearch}>
          Search
        </button>
        <button className="btn" onClick={handleAddRow}>
          New
        </button>
      </div>

      {message && (
        <div className={`message-box ${message.type}`}>{message.text}</div>
      )}

      <table className="flight-table">
        <thead>
          <tr>
            <th style={{ width: "140px" }}>Airline</th>
            <th style={{ width: "110px" }}>Flight</th>
            <th style={{ width: "100px" }}>Scheduled</th>
            <th style={{ width: "70px" }}>Time</th>
            <th style={{ width: "100px" }}>Estimated</th>
            <th style={{ width: "70px" }}>Time</th>
            <th style={{ width: "70px" }}>Type</th>
            <th>Origin/Destination</th>
            <th>Remarks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight, index) => {
            const isEditing = editedRows.has(index) || !flight.FlightId;
            return (
              <tr
                key={flight.FlightId || index}
                className={isEditing ? "highlight-row" : ""}
                onDoubleClick={() =>
                  setEditedRows((prev) => new Set(prev).add(index))
                }
              >
                <td>
                  {isEditing ? (
                    <select
                      value={flight.AirlineCode}
                      onChange={(e) =>
                        handleChange(index, "AirlineCode", e.target.value)
                      }
                    >
                      <option value="">-- Select --</option>
                      {airlines.map((a) => (
                        <option
                          key={a.AirlineCode}
                          value={a.AirlineCode}
                        >
                          {a.AirlineName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    airlines.find(
                      (a) => a.AirlineCode === flight.AirlineCode
                    )?.AirlineName || flight.AirlineCode
                  )}
                </td>
                <td style={{ outline: "1px solid red" }}>
                  {isEditing ? (
                    <input
                      value={flight.FlightNumber}
                      maxLength={5}
                      style={{ width: "60px" }}
                      onChange={(e) =>
                        handleChange(index, "FlightNumber", e.target.value)
                      }
                      placeholder="Number"
                    />
                  ) : (
                    <span>
                      {getFlightDisplay(flight)}
                    </span>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      value={flight.ScheduledDate}
                      maxLength={8}
                      onChange={(e) =>
                        handleChange(index, "ScheduledDate", e.target.value)
                      }
                    />
                  ) : (
                    flight.ScheduledDate
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      value={flight.ScheduledTime}
                      maxLength={4}
                      onChange={(e) =>
                        handleChange(index, "ScheduledTime", e.target.value)
                      }
                    />
                  ) : (
                    flight.ScheduledTime
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      value={flight.EstimatedDate || ""}
                      maxLength={8}
                      onChange={(e) =>
                        handleChange(index, "EstimatedDate", e.target.value)
                      }
                    />
                  ) : (
                    flight.EstimatedDate
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      value={flight.EstimatedTime || ""}
                      maxLength={4}
                      onChange={(e) =>
                        handleChange(index, "EstimatedTime", e.target.value)
                      }
                    />
                  ) : (
                    flight.EstimatedTime
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <select
                      value={flight.FlightType || "A"}
                      onChange={(e) =>
                        handleChange(index, "FlightType", e.target.value)
                      }
                    >
                      <option value="A">Arrival</option>
                      <option value="D">Departure</option>
                    </select>
                  ) : flight.FlightType === "A" ? (
                    "A"
                  ) : (
                    "D"
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <select
                      value={flight.OriginDestAirport}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "OriginDestAirport",
                          e.target.value
                        )
                      }
                    >
                      <option value="">-- Select --</option>
                      {airports.map((a) => (
                        <option
                          key={a.AirportCode}
                          value={a.AirportCode}
                        >
                          {a.AirportName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    airports.find(
                      (a) => a.AirportCode === flight.OriginDestAirport
                    )?.AirportName || flight.OriginDestAirport
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <select
                      value={flight.Remarks}
                      onChange={(e) =>
                        handleChange(index, "Remarks", e.target.value)
                      }
                    >
                      <option value="">-- Select --</option>
                      {remarks.map((a) => (
                        <option
                          key={a.RemarkCode}
                          value={a.RemarkCode}
                        >
                          {a.RemarkName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    flight.RemarkName || flight.RemarkCode
                  )}
                </td>
                <td>
                  <button
                    className="btn-sm"
                    onClick={() => handleSave(flight, index)}
                  >
                    Save
                  </button>
                  {isEditing ? (
                    <button
                      className="btn-sm cancel-btn"
                      onClick={() => handleCancel(index)}
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      className="btn-sm"
                      onClick={() => handleDelete(flight.FlightId)}
                      disabled={!flight.FlightId}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserMgtUserRole;
