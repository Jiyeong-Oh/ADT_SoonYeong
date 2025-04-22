import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FlightScheduleMgt.css";

const CodeMgt = () => {
  const [airports, setAirports] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [editedCells, setEditedCells] = useState(new Set());
  const [editedRows, setEditedRows] = useState(new Set());

  const [search, setSearch] = useState({
    code: "",
    name: "",
    city: "",
    country: "",
    yn: "Y"
  });

  useEffect(() => {
    fetchAirports();
  }, []);

  const fetchAirports = () => {
    axios.get("http://localhost:9999/api/airports")
      .then(res => {
        setAirports(res.data);
        setFilteredFlights(res.data); 
      })
      .catch(err => console.error("❌ Error loading airports", err));
  };

  const handleSearch = () => {
    axios.get("http://localhost:9999/api/airports_filter", { params: search })
      .then(res => 
        {console.log("🛬 Search result:", res.data); // ✅ 여기서 데이터 확인!
          console.log(search);
          setFilteredFlights(res.data);})
      
      .catch(err => console.error("❌ Search error", err));
  };

  const handleAddRow = () => {
    const newRow = {
      AirportCode: "",
      AirportName: "",
      City: "",
      Country: "",
      UseYn: "Y",
      isNew: true,
    };
  
    const newList = [...airports, newRow];  // ✅ 먼저 새 배열 생성
    setAirports(newList);
    setFilteredFlights(newList);           // ✅ 둘 다 같은 리스트로 업데이트
  };

  const handleChange = (index, field, value) => {
    // 1. filteredFlights 수정
    const updatedFiltered = [...filteredFlights];
    updatedFiltered[index][field] = value;
    setFilteredFlights(updatedFiltered);
  
    // 2. airports 배열도 수정 (AirportCode로 찾는 게 가장 안전)
    const targetCode = updatedFiltered[index].AirportCode;
    const updatedAirports = airports.map((airport) =>
      airport.AirportCode === targetCode
        ? { ...airport, [field]: value }
        : airport
    );
    setAirports(updatedAirports);
  
    // 3. 수정 상태 관리
    const updatedCells = new Set(editedCells);
    updatedCells.add(`${index}-${field}`);
    setEditedCells(updatedCells);
  
    const updatedRows = new Set(editedRows);
    updatedRows.add(index);
    setEditedRows(updatedRows);
  };

  const handleSave = (airport, index) => {
    if (!airport.AirportCode || !airport.AirportName || !airport.City || !airport.Country) {
      alert("❗ Please fill in all fields before saving.");
      return;
    }
  
    const isNew = !!airport.isNew;
  
    if (isNew) {
      axios.post("http://localhost:9999/api/airports", airport)
        .then(() => {
          fetchAirports();         // ✅ 전체 리스트를 다시 불러오면 중복 방지
          clearEditState(index);
        })
        .catch(() => alert("❌ Error saving airport."));
    } else {
      axios.put(`http://localhost:9999/api/airports/${airport.AirportCode}`, airport)
        .then(() => {
          fetchAirports();         // ✅ 동일하게 전체 새로고침
          clearEditState(index);
        })
        .catch(() => alert("❌ Error updating airport."));
    }
  };

  const clearEditState = (index) => {
    const airport = filteredFlights[index]; // 화면 기준으로 접근
    const target = airports.find(a => a.AirportCode === airport.AirportCode);
    if (!target) return;
  
    setEditedCells((prev) => {
      const updated = new Set(prev);
      Object.keys(target).forEach((field) => {
        updated.delete(`${index}-${field}`);
      });
      return updated;
    });
  
    setEditedRows((prev) => {
      const updated = new Set(prev);
      updated.delete(index);
      return updated;
    });
  };

  

  const handleDelete = (airport, index) => {
    if (airport.isNew) {
      const updatedFiltered = [...filteredFlights];
      updatedFiltered.splice(index, 1);
      setFilteredFlights(updatedFiltered);
  
      const updatedAll = airports.filter(a => a.AirportCode !== airport.AirportCode);
      setAirports(updatedAll);
      clearEditState(index);
    } else {
      axios.delete(`http://localhost:9999/api/airports/${airport.AirportCode}`)
        .then(() => {
          setAirports(prev => prev.filter(a => a.AirportCode !== airport.AirportCode));
          setFilteredFlights(prev => prev.filter(a => a.AirportCode !== airport.AirportCode));
          clearEditState(index);
        })
        .catch((err) => {
          console.error("❌ Delete error", err);
          alert("❌ Error deleting airport.");
        });
    }
  };

  return (

    <div className="flight-mgt-container">
      <div className="header-row">
        <h2>Airport Code Management</h2>
        <select value={search.code} onChange={(e) => setSearch({ ...search, code: e.target.value })}>
          <option value="">-- Code --</option>
          {[...new Set(airports.map(a => a.AirportCode))]
            .filter(Boolean)
            .sort()
            .map((code, i) => (
              <option key={i} value={code}>{code}</option>
            ))}
        </select>

        <select value={search.name} onChange={(e) => setSearch({ ...search, name: e.target.value })}>
          <option value="">-- Name --</option>
          {[...new Set(airports.map(a => a.AirportName))]
            .filter(Boolean)
            .sort()
            .map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
        </select>

        <select value={search.city} onChange={(e) => setSearch({ ...search, city: e.target.value })}>
          <option value="">-- City --</option>
          {[...new Set(airports.map(a => a.City))]
            .filter(Boolean)
            .sort()
            .map((city, i) => (
              <option key={i} value={city}>{city}</option>
            ))}
        </select>

        <select value={search.country} onChange={(e) => setSearch({ ...search, country: e.target.value })}>
          <option value="">-- Country --</option>
          {[...new Set(airports.map(a => a.Country))]
            .filter(Boolean)
            .sort()
            .map((country, i) => (
              <option key={i} value={country}>{country}</option>
            ))}
        </select>
        <button className="btn" onClick={handleSearch}>Search</button>
        <button className="btn" onClick={handleAddRow}>New</button>
      </div>

      <table className="flight-table">
        <thead>
          <tr>
            <th>Airport Code</th>
            <th>Airport Name </th>
            <th>City</th>
            <th>Country</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFlights.map((airport, index) => (
            <tr
              key={airport.id || index}
              className={editedRows.has(index) ? "highlight-row" : ""}
              onDoubleClick={() => setEdixtedRows(prev => new Set(prev).add(index))}
            >
              <td>
                {airport.isNew ? (
                  <input
                    value={airport.AirportCode}
                    onChange={(e) => handleChange(index, "AirportCode", e.target.value)}
                    style={{
                      fontWeight: editedCells.has(`${index}-AirportCode`) ? "bold" : "normal"
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontWeight: editedCells.has(`${index}-AirportCode`) ? "bold" : "normal"
                    }}
                  >
                    {airport.AirportCode}
                  </span>
                )}
              </td>
              <td>
                <input
                  value={airport.AirportName}
                  onChange={(e) => handleChange(index, "AirportName", e.target.value)}
                  style={{
                    fontWeight: editedCells.has(`${index}-AirportName`) ? "bold" : "normal"
                  }}
                />
              </td>
              <td>
                <input
                  value={airport.City}
                  onChange={(e) => handleChange(index, "City", e.target.value)}
                  style={{
                    fontWeight: editedCells.has(`${index}-City`) ? "bold" : "normal"
                  }}
                />
              </td>
              <td>
                <input
                  value={airport.Country}
                  onChange={(e) => handleChange(index, "Country", e.target.value)}
                  style={{
                    fontWeight: editedCells.has(`${index}-Country`) ? "bold" : "normal"
                  }}
                />
              </td>
              <td>
                <button className="btn-sm" onClick={() => handleSave(airport, index)}>Save</button>
                <button className="btn-sm danger" onClick={() => handleDelete(airport, index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CodeMgt;
