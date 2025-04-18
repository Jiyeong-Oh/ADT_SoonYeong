import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const App = () => {
    const [rowData, setRowData] = useState([]);
    const [newFlight, setNewFlight] = useState({
        FlightNumber: "",
        ScheduledDate: "",
        ScheduledTime: "",
        EstimatedDate: "",
        EstimatedTime: "",
        AirportCode: "",
        OriginDestAirport: "",
        AirlineCode: "",
        Remarks: "ON_TIME"
    });

    // Load flight data
    useEffect(() => {
        fetch("http://localhost:9999/api/flights")
            .then((res) => res.json())
            .then((data) => setRowData(data));
    }, []);

    // Add new flight
    const addFlight = () => {
        fetch("http://localhost:9999/api/flights", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newFlight),
        })
            .then((res) => res.json())
            .then(() => window.location.reload());
    };

    // Delete flight
    const deleteFlight = (id) => {
        fetch(`http://localhost:9999/api/flights/${id}`, { method: "DELETE" })
            .then(() => setRowData(rowData.filter((row) => row.FlightId !== id)));
    };

    // Column definitions
    const columnDefs = [
        { field: "FlightId", headerName: "ID", width: 80 },
        { field: "FlightNumber", headerName: "Flight Number", sortable: true },
        { field: "ScheduledDate", headerName: "Scheduled Date" },
        { field: "ScheduledTime", headerName: "Scheduled Time" },
        { field: "EstimatedDate", headerName: "Estimated Date" },
        { field: "EstimatedTime", headerName: "Estimated Time" },
        { field: "AirlineName", headerName: "Airline" },
        { field: "DepartureAirport", headerName: "Departure Airport" },
        { field: "ArrivalAirport", headerName: "Arrival Airport" },
        {
            field: "RemarkName",
            headerName: "Status",
            cellStyle: (params) => ({
                backgroundColor: params.value === "Delayed" ? "red" : "green",
                color: "white",
                fontWeight: "bold",
            }),
        },
        {
            headerName: "Delete",
            cellRenderer: (params) => (
                <button onClick={() => deleteFlight(params.data.FlightId)}>Delete</button>
            ),
        },
    ];

    return (
        <div style={{ width: "90%", margin: "auto", padding: "20px" }}>
            <h2>Flight Schedule Management</h2>

            {/* Flight input form */}
            <div style={{ marginBottom: "10px" }}>
                <input placeholder="Flight Number (e.g., 1234)"
                    onChange={(e) => setNewFlight({ ...newFlight, FlightNumber: e.target.value })} />
                <input placeholder="Scheduled Date (YYYYMMDD)"
                    onChange={(e) => setNewFlight({ ...newFlight, ScheduledDate: e.target.value })} />
                <input placeholder="Scheduled Time (HHmm)"
                    onChange={(e) => setNewFlight({ ...newFlight, ScheduledTime: e.target.value })} />
                <input placeholder="Estimated Date (YYYYMMDD)"
                    onChange={(e) => setNewFlight({ ...newFlight, EstimatedDate: e.target.value })} />
                <input placeholder="Estimated Time (HHmm)"
                    onChange={(e) => setNewFlight({ ...newFlight, EstimatedTime: e.target.value })} />
                <input placeholder="Departure Airport Code (e.g., IND)"
                    onChange={(e) => setNewFlight({ ...newFlight, AirportCode: e.target.value })} />
                <input placeholder="Arrival Airport Code (e.g., ORD)"
                    onChange={(e) => setNewFlight({ ...newFlight, OriginDestAirport: e.target.value })} />
                <input placeholder="Airline Code (e.g., AA)"
                    onChange={(e) => setNewFlight({ ...newFlight, AirlineCode: e.target.value })} />
                <select onChange={(e) => setNewFlight({ ...newFlight, Remarks: e.target.value })}>
                    <option value="ON_TIME">On Time</option>
                    <option value="DELAYED">Delayed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
                <button onClick={addFlight}>Add</button>
            </div>

            {/* AG Grid table */}
            <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
                <AgGridReact rowData={rowData} columnDefs={columnDefs} />
            </div>
        </div>
    );
};

export default App;
