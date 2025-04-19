import React, { useState } from "react";
import axios from "axios";
import "./Admin.css"; // Custom styling

const Admin = () => {
    const [newFlight, setNewFlight] = useState({
        FlightNumber: "",
        ScheduledDate: "",
        ScheduledTime: "",
        EstimatedDate: "",
        EstimatedTime: "",
        AirportCode: "",
        OriginDestAirport: "",
        AirlineCode: "",
        Remarks: "ON_TIME",
    });

    const [message, setMessage] = useState("");

    const addFlight = () => {
        axios.post("http://localhost:9999/api/flights", newFlight)
            .then(() => {
                setMessage("✅ Flight added successfully!");
                setNewFlight({
                    FlightNumber: "",
                    ScheduledDate: "",
                    ScheduledTime: "",
                    EstimatedDate: "",
                    EstimatedTime: "",
                    AirportCode: "",
                    OriginDestAirport: "",
                    AirlineCode: "",
                    Remarks: "ON_TIME",
                });
            })
            .catch(() => {
                setMessage("❌ Error adding flight. Try again.");
            });
    };

    return (
        <div className="admin-container">
            <h2 className="admin-title">Admin Panel - Add Flight</h2>

            <div className="admin-form">
                <input
                    type="text"
                    placeholder="Flight Number (e.g. 1234)"
                    value={newFlight.FlightNumber}
                    onChange={(e) => setNewFlight({ ...newFlight, FlightNumber: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Scheduled Date (YYYYMMDD)"
                    value={newFlight.ScheduledDate}
                    onChange={(e) => setNewFlight({ ...newFlight, ScheduledDate: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Scheduled Time (HHmm)"
                    value={newFlight.ScheduledTime}
                    onChange={(e) => setNewFlight({ ...newFlight, ScheduledTime: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Estimated Date (YYYYMMDD)"
                    value={newFlight.EstimatedDate}
                    onChange={(e) => setNewFlight({ ...newFlight, EstimatedDate: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Estimated Time (HHmm)"
                    value={newFlight.EstimatedTime}
                    onChange={(e) => setNewFlight({ ...newFlight, EstimatedTime: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Departure Airport Code (e.g. IND)"
                    value={newFlight.AirportCode}
                    onChange={(e) => setNewFlight({ ...newFlight, AirportCode: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Arrival Airport Code (e.g. ORD)"
                    value={newFlight.OriginDestAirport}
                    onChange={(e) => setNewFlight({ ...newFlight, OriginDestAirport: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Airline Code (e.g. AA)"
                    value={newFlight.AirlineCode}
                    onChange={(e) => setNewFlight({ ...newFlight, AirlineCode: e.target.value })}
                />
                <select
                    value={newFlight.Remarks}
                    onChange={(e) => setNewFlight({ ...newFlight, Remarks: e.target.value })}
                >
                    <option value="ON_TIME">On Time</option>
                    <option value="DELAYED">Delayed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>

                <button onClick={addFlight} className="admin-btn">Add Flight</button>

                {message && <p className="admin-message">{message}</p>}
            </div>
        </div>
    );
};

export default Admin;
