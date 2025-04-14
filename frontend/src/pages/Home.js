import React, { useState, useEffect } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";
import "./Home.css";

// ✅ Register Required AG Grid Modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const Home = () => {
    const [flights, setFlights] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        axios.get("http://localhost:9999/api/flights")
            .then((response) => {
                console.log("✅ API Response Data:", response.data);

                const formattedData = response.data.map(flight => ({
                    id: flight.id,
                    sta: flight.sta || "--:--",
                    eta: flight.eta || "--:--",
                    airline: flight.airline || "Unknown",
                    logo: flight.logo || "https://via.placeholder.com/40",
                    flight_number: flight.flight_number || "N/A",
                    origin: flight.origin || "Unknown",
                    remark: flight.remark || "Scheduled"
                }));

                setFlights(formattedData);

                if (gridApi) {
                    gridApi.setRowData(formattedData);
                }
            })
            .catch(error => {
                console.error("❌ Error fetching flight data:", error);
            });

        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, [gridApi]);

    const columnDefs = [
        { field: "sta", headerName: "STA", width: 80, cellClass: "center-text bold-text" },
        { field: "eta", headerName: "ETA", width: 80, cellClass: "center-text bold-text" },
        {
            field: "airline",
            headerName: "Airline",
            width: 220,
            cellRenderer: (params) => (
                <div className="airline-cell">
                    <img src={params.data.logo} alt="Airline Logo" className="airline-logo" />
                    <span className="airline-name">{params.value}</span>
                </div>
            ),
        },
        { field: "flight_number", headerName: "Flight", width: 120, cellClass: "center-text bold-text" },
        { field: "origin", headerName: "Orign", width: 180, cellClass: "center-text" },
        {
            field: "remark",
            headerName: "Remark",
            width: 150,
            cellClass: (params) => params.value === "LANDED" ? "remark-landed" : "remark-delayed"
        },
    ];

    return (
        <div className="fids-container">
            <div className="fids-header">
                <h2 className="">
                    <img src="/arrival.png" alt="Arrival Icon" className="fids-icon" />
                         Arrivals
                </h2>
                <div className="fids-clock">{currentTime.toLocaleTimeString()}</div>
            </div>

            <div className="ag-theme-alpine-dark fids-table">
                <AgGridReact
                    rowData={flights}
                    columnDefs={columnDefs}
                    domLayout="autoHeight"
                    rowHeight={50}
                    headerHeight={40}
                    animateRows={true}
                    onGridReady={(params) => setGridApi(params.api)}
                />
            </div>
        </div>
    );
};

export default Home;
