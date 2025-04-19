import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FlightScheduleMgt.css";

const FlightScheduleMgt = () => {
  const [flights, setFlights] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = () => {
    axios.get("http://localhost:9999/api/flights")
      .then(res => setFlights(res.data))
      .catch(err => console.error("❌ Error loading flights", err));
  };

  const handleSearch = () => {
    axios.get(`http://localhost:9999/api/flights?airport=${searchCode}`)
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
    setFlights(updatedFlights);
  };

  const handleSave = (flight, index) => {
    axios.post("http://localhost:9999/api/flights", flight)
      .then(() => {
        setMessage("✅ Flight saved successfully!");
        fetchFlights();
      })
      .catch(() => setMessage("❌ Error saving flight."));
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:9999/api/flights/${id}`)
      .then(() => fetchFlights())
      .catch(err => console.error("❌ Delete error", err));
  };

  return (
    <div className="flight-mgt-container">
      <div className="header-row">
        <h2>Active Flight Schedule Management</h2>
        <input
          className="search-input"
          placeholder="Search by Airport Code"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
        />
        <button className="btn" onClick={handleSearch}>Retrieve</button>
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
            <th>From</th>
            <th>To</th>
            <th>Airline</th>
            <th>Remarks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight, index) => (
            <tr key={flight.id || index}>
              <td><input value={flight.FlightNumber} onChange={(e) => handleChange(index, "FlightNumber", e.target.value)} /></td>
              <td><input value={flight.ScheduledDate} onChange={(e) => handleChange(index, "ScheduledDate", e.target.value)} /></td>
              <td><input value={flight.ScheduledTime} onChange={(e) => handleChange(index, "ScheduledTime", e.target.value)} /></td>
              <td><input value={flight.EstimatedDate} onChange={(e) => handleChange(index, "EstimatedDate", e.target.value)} /></td>
              <td><input value={flight.EstimatedTime} onChange={(e) => handleChange(index, "EstimatedTime", e.target.value)} /></td>
              <td><input value={flight.AirportCode} onChange={(e) => handleChange(index, "AirportCode", e.target.value)} /></td>
              <td><input value={flight.OriginDestAirport} onChange={(e) => handleChange(index, "OriginDestAirport", e.target.value)} /></td>
              <td><input value={flight.AirlineCode} onChange={(e) => handleChange(index, "AirlineCode", e.target.value)} /></td>
              <td>
                <select value={flight.Remarks} onChange={(e) => handleChange(index, "Remarks", e.target.value)}>
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

      {message && <p className="message-text">{message}</p>}
    </div>
  );
};

export default FlightScheduleMgt;