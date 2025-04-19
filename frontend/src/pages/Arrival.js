import React, { useState, useEffect } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";
import "./Arrival.css";

// Register AG Grid Modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const Arrival = () => {
  const [flights, setFlights] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const formatTime = (hhmm) => {
    if (!hhmm || hhmm.length !== 4) return "--:--";
    return `${hhmm.slice(0, 2)}:${hhmm.slice(2)}`;
  };

  useEffect(() => {
    axios.get("http://localhost:9999/api/flights")
      .then((response) => {
        const formattedData = response.data.map(flight => ({
          id: flight.FlightId,
          sta: formatTime(flight.ScheduledTime),
          eta: formatTime(flight.EstimatedTime),
          airline: flight.AirlineName || "Unknown",
          logo: flight.LogoPath || "/images/blank.png",
          flight_number: flight.AirlineCode && flight.FlightNumber ? `${flight.AirlineCode} ${flight.FlightNumber}` : "N/A",
          origin: flight.ArrivalAirport || flight.OriginDestAirport || "Unknown",
          remark: flight.RemarkName || "Scheduled"
        }));

        setFlights(formattedData);
        if (gridApi) gridApi.setRowData(formattedData);
      })
      .catch(error => console.error("❌ Error fetching flight data:", error));

    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [gridApi]);

  useEffect(() => {
    const handleResize = () => {
      if (gridApi) gridApi.sizeColumnsToFit();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [gridApi]);

  const columnDefs = [
    { field: "sta", headerName: "STA", cellClass: "center-text bold-text", headerClass: "center-header" },
    { field: "eta", headerName: "ETA", cellClass: "center-text bold-text", headerClass: "center-header" },
    {
      field: "airline",
      headerName: "Airline",
      headerClass: "center-header",
      cellRenderer: (params) => (
        <div className="airline-cell">
          <img
            src={params.data.logo}
            alt="Airline Logo"
            className="airline-logo"
            onError={(e) => { e.target.src = "/images/blank.png"; }}
          />
          <span className="airline-name">{params.value}</span>
        </div>
      )
    },
    { field: "flight_number", headerName: "Flight", cellClass: "center-text bold-text", headerClass: "center-header" },
    { field: "origin", headerName: "Origin", cellClass: "center-text", headerClass: "center-header" },
    {
      field: "remark",
      headerName: "Remark",
      headerClass: "center-header",
      cellClass: (params) =>
        params.value === "LANDED" ? "remark-landed" : "remark-delayed"
    }
  ];

  return (
    <div className="fids-container">
      <div className="fids-header">
        <h2>
          <img src="/images/arrival.png" alt="Arrival Icon" className="fids-icon" />
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
          onGridReady={(params) => {
            setGridApi(params.api);
            params.api.sizeColumnsToFit();
          }}
          onFirstDataRendered={(params) => params.api.sizeColumnsToFit()}
        />
      </div>
    </div>
  );
};

export default Arrival;
