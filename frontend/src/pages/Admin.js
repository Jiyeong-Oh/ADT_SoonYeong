import React, { useState } from "react";
import axios from "axios";
import "./Admin.css"; // Custom styling

const Admin = () => {
    const [newFlight, setNewFlight] = useState({
        sta: "",
        eta: "",
        airline: "",
        logo: "",
        flight_number: "",
        origin: "",
        remark: "Scheduled",
    });

    const [message, setMessage] = useState("");

    const addFlight = () => {
        axios.post("http://localhost:9999/api/flights", newFlight)
            .then(() => {
                setMessage("✅ Flight added successfully!");
                setNewFlight({
                    sta: "",
                    eta: "",
                    airline: "",
                    logo: "",
                    flight_number: "",
                    origin: "",
                    remark: "Scheduled",
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
                    placeholder="STA (Scheduled Time)"
                    value={newFlight.sta}
                    onChange={(e) => setNewFlight({ ...newFlight, sta: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="ETA (Estimated Time)"
                    value={newFlight.eta}
                    onChange={(e) => setNewFlight({ ...newFlight, eta: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Airline Name"
                    value={newFlight.airline}
                    onChange={(e) => setNewFlight({ ...newFlight, airline: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Airline Logo URL"
                    value={newFlight.logo}
                    onChange={(e) => setNewFlight({ ...newFlight, logo: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Flight Number"
                    value={newFlight.flight_number}
                    onChange={(e) => setNewFlight({ ...newFlight, flight_number: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Origin (City)"
                    value={newFlight.origin}
                    onChange={(e) => setNewFlight({ ...newFlight, origin: e.target.value })}
                />
                <select
                    value={newFlight.remark}
                    onChange={(e) => setNewFlight({ ...newFlight, remark: e.target.value })}
                >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Landed">Landed</option>
                    <option value="Delayed">Delayed</option>
                </select>

                <button onClick={addFlight} className="admin-btn">Add Flight</button>

                {message && <p className="admin-message">{message}</p>}
            </div>
        </div>
    );
};

export default Admin;
