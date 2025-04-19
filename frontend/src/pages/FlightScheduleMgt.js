import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FlightScheduleMgt.css";

const FlightScheduleMgt = () => {
  const [flights, setFlights] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [airports, setAirports] = useState([]);
  const [editedCells, setEditedCells] = useState(new Set());
  const [editedRows, setEditedRows] = useState(new Set());

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
  }, []);

  const fetchFlights = () => {
    axios.get("http://localhost:9999/api/flights")
      .then(res => setFlights(res.data))
      .catch(err => console.error("❌ Error loading flights", err));
  };

  const fetchAirlines = () => {
    axios.get("http://localhost:9999/api/airlines")
      .then(res => setAirlines(res.data))
      .catch(err => console.error("❌ Error loading airlines", err));
  };

  const fetchAirports = () => {
    axios.get("http://localhost:9999/api/airports")
      .then(res => setAirports(res.data))
      .catch(err => console.error("❌ Error loading airports", err));
  };

  const handleSearch = () => {
    axios.get("http://localhost:9999/api/flights", { params: search })
      .then(res => setFlights(res.data))
      .catch(err => console.error("❌ Search error", err));
  };

  const handleAddRow = () => {
    const newRow = {
      FlightNumber: "",
      ScheduledDate: "",
      ScheduledTime: "",
      EstimatedDate: "",
      EstimatedTime: "",
      AirportCode: "",
      OriginDestAirport: "",
      AirlineCode: "",
      Remarks: "ON_TIME",
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

  const handleSave = (flight, index) => {
    axios.post("http://localhost:9999/api/flights", flight)
      .then(() => {
        setEditedCells(prev => {
          const updated = new Set(prev);
          Object.keys(flight).forEach(field => {
            updated.delete(`${index}-${field}`);
          });
          return updated;
        });
        setEditedRows(prev => {
          const updated = new Set(prev);
          updated.delete(index);
          return updated;
        });
        fetchFlights();
      })
      .catch(() => alert("❌ Error saving flight."));
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:9999/api/flights/${id}`)
      .then(() => fetchFlights())
      .catch(err => console.error("❌ Delete error", err));
  };

  return (
    <div className="flight-mgt-container">
      <div className="header-row">
        <h2>Flight Schedule Management</h2>
        <select value={search.airline} onChange={(e) => setSearch({ ...search, airline: e.target.value })}>
          <option value="">-- Airline --</option>
          {airlines.map(a => <option key={a.AirlineCode} value={a.AirlineCode}>{a.AirlineName}</option>)}
        </select>
        <select value={search.airport} onChange={(e) => setSearch({ ...search, airport: e.target.value })}>
          <option value="">-- Airport --</option>
          {airports.map(a => <option key={a.AirportCode} value={a.AirportCode}>{a.AirportName}</option>)}
        </select>
        <input
          className="search-input"
          placeholder="Flight Number"
          value={search.flightNumber}
          onChange={(e) => setSearch({ ...search, flightNumber: e.target.value })}
        />
        <input
          type="date"
          className="search-input"
          value={search.date}
          onChange={(e) => setSearch({ ...search, date: e.target.value })}
        />
        <button className="btn" onClick={handleSearch}>Search</button>
        <button className="btn" onClick={handleAddRow}>New</button>
      </div>

      <table className="flight-table">
        <thead>
          <tr>
            <th>Flight</th>
            <th>Sched Date</th>
            <th>Sched Time</th>
            <th>Est Date</th>
            <th>Est Time</th>
            <th>Origin/Destination</th>
            <th>Airline</th>
            <th>Remarks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight, index) => (
            <tr
              key={flight.id || index}
              className={editedRows.has(index) ? "highlight-row" : ""}
              onDoubleClick={() => setEditedRows(prev => new Set(prev).add(index))}
            >
              <td style={{
                fontWeight:
                  editedCells.has(`${index}-AirlineCode`) ||
                  editedCells.has(`${index}-FlightNumber`)
                    ? "bold"
                    : "normal"
              }}>
                {`${flight.AirlineCode || ""} ${flight.FlightNumber || ""}`}
              </td>
              <td>
                <input
                  value={flight.ScheduledDate}
                  onChange={(e) => handleChange(index, "ScheduledDate", e.target.value)}
                  style={{
                    fontWeight: editedCells.has(`${index}-ScheduledDate`) ? "bold" : "normal"
                  }}
                />
              </td>
              <td>
                <input
                  value={flight.ScheduledTime}
                  onChange={(e) => handleChange(index, "ScheduledTime", e.target.value)}
                  style={{
                    fontWeight: editedCells.has(`${index}-ScheduledTime`) ? "bold" : "normal"
                  }}
                />
              </td>
              <td>
                <input
                  value={flight.EstimatedDate}
                  onChange={(e) => handleChange(index, "EstimatedDate", e.target.value)}
                  style={{
                    fontWeight: editedCells.has(`${index}-EstimatedDate`) ? "bold" : "normal"
                  }}
                />
              </td>
              <td>
                <input
                  value={flight.EstimatedTime}
                  onChange={(e) => handleChange(index, "EstimatedTime", e.target.value)}
                  style={{
                    fontWeight: editedCells.has(`${index}-EstimatedTime`) ? "bold" : "normal"
                  }}
                />
              </td>
              <td>
                <select
                  value={flight.OriginDestAirport}
                  onChange={(e) => handleChange(index, "OriginDestAirport", e.target.value)}
                  style={{
                    fontWeight: editedCells.has(`${index}-OriginDestAirport`) ? "bold" : "normal"
                  }}
                >
                  <option value="">-- Select --</option>
                  {airports.map(a => <option key={a.AirportCode} value={a.AirportCode}>{a.AirportName}</option>)}
                </select>
              </td>
              <td>
                <select
                  value={flight.AirlineCode}
                  onChange={(e) => handleChange(index, "AirlineCode", e.target.value)}
                  style={{
                    fontWeight: editedCells.has(`${index}-AirlineCode`) ? "bold" : "normal"
                  }}
                >
                  <option value="">-- Select --</option>
                  {airlines.map(a => <option key={a.AirlineCode} value={a.AirlineCode}>{a.AirlineName}</option>)}
                </select>
              </td>
              <td>
                <select
                  value={flight.Remarks}
                  onChange={(e) => handleChange(index, "Remarks", e.target.value)}
                  style={{
                    fontWeight: editedCells.has(`${index}-Remarks`) ? "bold" : "normal"
                  }}
                >
                  <option value="ON_TIME">On Time</option>
                  <option value="DELAYED">Delayed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </td>
              <td>
                <button className="btn-sm" onClick={() => handleSave(flight, index)}>Save</button>
                {flight.id && <button className="btn-sm" onClick={() => handleDelete(flight.id)}>Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FlightScheduleMgt;
