import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

const Home = () => {
  const [summary, setSummary] = useState({
    users: 0,
    airlines: 0,
    airports: 0,
    flights: 0,
    roles: 0,
  });
  const [airlineFlightData, setAirlineFlightData] = useState([]);
  const [airportFlightData, setAirportFlightData] = useState([]);

  useEffect(() => {
    // 통계 요약 정보
    Promise.all([
      axios.get("http://localhost:9999/api/users"),
      axios.get("http://localhost:9999/api/airlines"),
      axios.get("http://localhost:9999/api/airports"),
      axios.get("http://localhost:9999/api/flights"),
      axios.get("http://localhost:9999/api/roles"),
    ])
      .then(([users, airlines, airports, flights, roles]) => {
        setSummary({
          users: users.data.length,
          airlines: airlines.data.length,
          airports: airports.data.length,
          flights: flights.data.length,
          roles: roles.data.length,
        });

        // 항공사별 운항편 수 세기
        const airlineMap = {};
        flights.data.forEach((flight) => {
          const name = flight.AirlineName || "Unknown";
          airlineMap[name] = (airlineMap[name] || 0) + 1;
        });

        const chartData = Object.entries(airlineMap).map(([name, count]) => ({
          AirlineName: name,
          count,
        }));
        setAirlineFlightData(chartData);

        const airportMap = {};
        flights.data.forEach((flight) => {
          const name = flight.AirportName || "Unknown";  // ✅ 이름 기준으로 그룹
          airportMap[name] = (airportMap[name] || 0) + 1;
        });

        const airportChartData = Object.entries(airportMap).map(([name, count]) => ({
          AirportName: name,
          FlightCount: count,
        }));
        console.log(airportChartData);
        setAirportFlightData(airportChartData);

      })
      .catch((err) => console.error("❌ Dashboard load error:", err));
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        🛫 Welcome to the Dashboard
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: "0.8rem",
          marginBottom: "0.2rem",
        }}
      >
        {/* <SummaryCard label="Users" count={summary.users} /> */}
        <SummaryCard label="Airlines" count={summary.airlines} />
        <SummaryCard label="Airports" count={summary.airports} />
        <SummaryCard label="Flights" count={summary.flights} />
        {/* <SummaryCard label="Roles" count={summary.roles} /> */}
      </div>

      <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "1rem",
        marginTop: "2rem",
      }}
    >
      {airlineFlightData.length > 0 && (
        <div style={{ flex: "1 1 40%", minWidth: "300px", height: "350px" }}>
          <h3 style={{ textAlign: "center" }}>📊 Flight Distribution by Airline</h3>
          <AirlinePieChart data={airlineFlightData} />
        </div>
      )}

      {airportFlightData.length > 0 && (
        <div style={{ flex: "1 1 50%", minWidth: "300px", height: "350px" }}>
          <h3 style={{ textAlign: "center" }}>🛬 Flight Count by Airport</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={airportFlightData} layout="vertical" margin={{ left: 60 }}>
              <XAxis type="number" />
              <YAxis
                dataKey="AirportName"
                type="category"
                width={120} // 너비를 넉넉히 줘야 함
                tick={{ fontSize: 11, angle: -15, textAnchor: "end" }}
              />
              <Tooltip />
              <Bar dataKey="FlightCount" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
    </div>
  );
};

const SummaryCard = ({ label, count }) => (
  <div
    style={{
      padding: "1rem",
      border: "1px solid #ccc",
      borderRadius: "8px",
      textAlign: "center",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      backgroundColor: "#f9fafb",
    }}
  >
    <h3 style={{ marginBottom: "0.5rem" }}>{label}</h3>
    <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#2563eb" }}>
      {count}
    </p>
  </div>
);

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#f43f5e"];
const AirlinePieChart = ({ data }) => {
  const chartData = data.map((a) => ({
    name: a.AirlineName,
    value: a.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
  <PieChart>
    <Pie
      data={chartData}
      dataKey="value"
      cx="50%"
      cy="50%"
      outerRadius="80%"
      labelLine={false}
      label={({ name, percent }) =>
        `${name} (${(percent * 100).toFixed(1)}%)`
      }
    >
      {chartData.map((_, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip formatter={(value, name) => [`${value} flights`, name]} />
    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
  </PieChart>
</ResponsiveContainer>
  );
};

export default Home;