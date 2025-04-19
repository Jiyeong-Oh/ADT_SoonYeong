import React, { useState, useEffect } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";
import "./Departure.css";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const Departure = ({ type = "D" }) => {
  const [flights, setFlights] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const formatTime = (hhmm) => {
    if (!hhmm || hhmm.length !== 4) return "--:--";
    return `${hhmm.slice(0, 2)}:${hhmm.slice(2)}`;
  };

  useEffect(() => {
    axios.get("http://localhost:9999/api/flights")
      .then((response) => {
        const rawFlights = response.data;

        const filtered = rawFlights.filter(flight => {
          if (type === "ALL") return true;
          return flight.FlightType === type;
        });

        const formattedData = filtered.map(flight => ({
          id: flight.FlightId,
          std: formatTime(flight.ScheduledTime),
          etd: formatTime(flight.EstimatedTime),
          airline: flight.AirlineName || "Unknown",
          logo: flight.LogoPath || "/images/blank.png",
          flight_number: flight.AirlineCode && flight.FlightNumber
            ? `${flight.AirlineCode} ${flight.FlightNumber}` : "N/A",
          destination: flight.AirportName || "Unknown",
          remark: flight.RemarkName || "Scheduled"
        }));

        setFlights(formattedData);

        if (gridApi) {
          gridApi.setRowData(formattedData);
          gridApi.sizeColumnsToFit();
        }
      })
      .catch(error => console.error("❌ Error fetching flight data:", error));

    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [gridApi, type]);

  useEffect(() => {
    const handleResize = () => {
      if (gridApi) gridApi.sizeColumnsToFit();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [gridApi]);

  const columnDefs = [
    { field: "std", headerName: "STD", flex: 1, cellClass: "center-text bold-text", headerClass: "center-header" },
    { field: "etd", headerName: "ETD", flex: 1, cellClass: "center-text bold-text", headerClass: "center-header" },
    {
      field: "airline",
      headerName: "Airline",
      flex: 2,
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
    { field: "flight_number", headerName: "Flight", flex: 2, cellClass: "center-text bold-text", headerClass: "center-header" },
    { field: "destination", headerName: "Destination", flex: 3, cellClass: "left-text", headerClass: "center-header" },
    {
      field: "remark",
      headerName: "Status",
      flex: 2,
      headerClass: "center-header",
      cellClass: (params) => {
        const base = "left-text";
        const value = params.value?.toUpperCase();

        if (value === "DELAYED") return `${base} remark-delayed`;
        if (value === "DEPARTED") return `${base} remark-departed`;
        if (value === "BOARDING") return `${base} remark-boarding`;
        if (value === "PROGRESSING") return `${base} remark-progressing`;

        return `${base} remark-normal`;
      }
    }
  ];

  return (
    <div className={`fids-container ${isFullscreen ? "fullscreen" : ""}`}>
      <div className="fids-header">
        <h2>
          <img src="/images/arrival.png" alt="Arrival Icon" className="fids-icon" />
          {type === "A" ? "Arrivals" : type === "D" ? "Departures" : "All Flights"}
        </h2>

        <div className="fids-right">
          <button className="fullscreen-button" onClick={toggleFullscreen}>
            {isFullscreen ? "⤴ Exit Fullscreen" : "⤢ Fullscreen"}
          </button>
          <div className="fids-clock">{currentTime.toLocaleTimeString()}</div>
        </div>
      </div>

      <div className="ag-theme-alpine-dark fids-table">
        <AgGridReact
          rowData={flights}
          columnDefs={columnDefs}
          domLayout="autoHeight"
          rowHeight={70}
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

export default Departure;
