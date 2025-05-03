import React, { useState, useEffect } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import axios from "axios";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./Mixed.css";
import AirlineLogo from "../components/AirlineLogo";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const Mixed = () => {
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [arrivalGridApi, setArrivalGridApi] = useState(null);
  const [departureGridApi, setDepartureGridApi] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const formatTime = (hhmm) => {
    if (!hhmm || hhmm.length !== 4) return "--:--";
    return `${hhmm.slice(0, 2)}:${hhmm.slice(2)}`;
  };

  useEffect(() => {
    const fetchData = () => {
      axios.get("http://localhost:9999/api/flights")
        .then((response) => {
          const rawFlights = response.data;
  
          const processData = (type) => rawFlights
            .filter(flight => flight.FlightType === type)
            .map(flight => ({
              id: flight.FlightId,
              time: formatTime(flight.ScheduledTime),
              estimated: formatTime(flight.EstimatedTime),
              airline: flight.AirlineName || "Unknown",
              logo: flight.LogoPath || "/images/blank.png",
              flightNumber: flight.AirlineCode && flight.FlightNumber
                ? `${flight.AirlineCode} ${flight.FlightNumber}` : "N/A",
              location: flight.AirportName || "Unknown",
              status: flight.RemarkName || "Scheduled"
            }));
  
          setArrivals(processData("A"));
          setDepartures(processData("D"));
        })
        .catch(error => console.error("❌ Error fetching flight data:", error));
    };
  
    fetchData();
  
    const dataInterval = setInterval(fetchData, 1000);
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
  
    // cleanup
    return () => {
      clearInterval(dataInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const commonColumnDefs = {
    flex: 1,
    cellClass: "mixed-fids-center-text",
    headerClass: "center-header",
    suppressMovable: true
  };

  const arrivalColumns = [
    { 
      ...commonColumnDefs,
      field: "time",
      headerName: "STA",
      flex: 1
    },
    { 
      ...commonColumnDefs,
      field: "estimated",
      headerName: "ETA"
    },
    {
      ...commonColumnDefs,
      field: "airline",
      headerName: "Airline",
      flex: 1.5,
      cellRenderer: (params) => (
        <div className="mixed-fids-airline-cell">
          <AirlineLogo src={params.data.logo} alt="Airline" />
        </div>
      )
    },
    { 
      ...commonColumnDefs,
      field: "flightNumber",
      headerName: "Flight",
      flex: 2
    },
    { 
      ...commonColumnDefs,
      field: "location",
      headerName: "Origin",
      flex: 3,
      cellRenderer: (params) => (
        <div className="mixed-fids-scroll-cell">
          <span>{params.value}</span>
        </div>
      )
    },
    {
      ...commonColumnDefs,
      field: "status",
      flex: 1.5,
      headerName: "Status",
      cellClass: (params) => `mixed-fids-status-${params.value.toLowerCase()} mixed-fids-center-text`
    }
  ];

  const departureColumns = [
    { 
      ...commonColumnDefs,
      field: "time",
      headerName: "STD"
    },
    { 
      ...commonColumnDefs,
      field: "estimated",
      headerName: "ETD"
    },
    {
      ...commonColumnDefs,
      field: "airline",
      headerName: "Airline",
      flex: 1.5,
      cellRenderer: (params) => (
        <div className="mixed-fids-airline-cell">
          <img
            src={params.data.logo}
            alt="Airline"
            className="mixed-fids-airline-logo"
            onError={(e) => { e.target.src = "/images/blank.png"; }}
          />
        </div>
      )
    },
    { 
      ...commonColumnDefs,
      field: "flightNumber",
      headerName: "Flight",
      flex: 2
    },
    { 
      ...commonColumnDefs,
      field: "location",
      headerName: "Destination",
      flex: 3,
      cellRenderer: (params) => (
        <div className="mixed-fids-scroll-cell">
          <span>{params.value}</span>
        </div>
      )
    },
    {
      ...commonColumnDefs,
      field: "status",
      flex: 1.5,
      headerName: "Status",
      cellClass: (params) => `mixed-fids-status-${params.value.toLowerCase()} mixed-fids-center-text`
    }
  ];

  return (
    <div className="mixed-fids-container">
      {/* Arrivals Panel */}
      <div className="mixed-fids-panel mixed-fids-arrivals">
        <div className="mixed-fids-header">
          <h2>
            <img src="/images/arrival.png" alt="Arrivals" />
            Arrivals
          </h2>
          <div className="mixed-fids-time">{currentTime.toLocaleTimeString()}</div>
        </div>
        <div className="ag-theme-alpine mixed-fids-ag-theme-alpine-dark">
          <AgGridReact
            rowData={arrivals}
            columnDefs={arrivalColumns}
            domLayout="autoHeight"
            rowHeight={60}
            headerHeight={40}
            onGridReady={(params) => {
              setArrivalGridApi(params.api);
              params.api.sizeColumnsToFit();
            }}
          />
        </div>
      </div>

      {/* Departures Panel */}
      <div className="mixed-fids-panel mixed-fids-departures">
        <div className="mixed-fids-header">
          <h2>
            <img src="/images/departure.png" alt="Departures" />
            Departures
          </h2>
          <div className="mixed-fids-time">{currentTime.toLocaleTimeString()}</div>
        </div>
        <div className="ag-theme-alpine mixed-fids-ag-theme-alpine-dark">
          <AgGridReact
            rowData={departures}
            columnDefs={departureColumns}
            domLayout="autoHeight"
            rowHeight={60}
            headerHeight={40}
            onGridReady={(params) => {
              setDepartureGridApi(params.api);
              params.api.sizeColumnsToFit();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Mixed;