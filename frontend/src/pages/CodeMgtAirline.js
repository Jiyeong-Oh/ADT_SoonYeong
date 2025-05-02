import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FlightScheduleMgt.css";

const CodeMgtAirline = () => {
  const [airlines, setAirlines] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [editedCells, setEditedCells] = useState(new Set());
  const [editedRows, setEditedRows] = useState(new Set());

  const [search, setSearch] = useState({
    code: "",
    name: "",
    logopath: "",
    yn: "Y"
  });

  useEffect(() => {
    fetchAirlines();
  }, []);

  const fetchAirlines = () => {
    axios.get("http://localhost:9999/api/airlines")
      .then(res => {
        setAirlines(res.data);
        setFilteredFlights(res.data); 
      })
      .catch(err => console.error("❌ Error loading airlines", err));
  };

  const handleSearch = () => {
    axios.get("http://localhost:9999/api/airlines_filter", { params: search })
      .then(res => 
        {console.log("🛬 Search result:", res.data); // ✅ 여기서 데이터 확인!
          console.log(search);
          setFilteredFlights(res.data);})
      
      .catch(err => console.error("❌ Search error", err));
  };

  const handleAddRow = () => {
    const newRow = {
      AirlineCode: "",
      AirlineName: "",
      LogoPath: "",
      UseYn: "Y",
      isNew: true,
    };
  
    const newList = [...airlines, newRow];  // ✅ 먼저 새 배열 생성
    setAirlines(newList);
    setFilteredFlights(newList);           // ✅ 둘 다 같은 리스트로 업데이트
  };

  const handleChange = (index, field, value) => {
    // 1. filteredFlights 수정
    const updatedFiltered = [...filteredFlights];
    updatedFiltered[index][field] = value;
    setFilteredFlights(updatedFiltered);
  
    // 2. airlines 배열도 수정 (AirlineCode로 찾는 게 가장 안전)
    const targetCode = updatedFiltered[index].AirlineCode;
    const updatedAirlines = airlines.map((airline) =>
      airline.AirlineCode === targetCode
        ? { ...airline, [field]: value }
        : airline
    );
    setAirlines(updatedAirlines);
  
    // 3. 수정 상태 관리
    const updatedCells = new Set(editedCells);
    updatedCells.add(`${index}-${field}`);
    setEditedCells(updatedCells);
  
    const updatedRows = new Set(editedRows);
    updatedRows.add(index);
    setEditedRows(updatedRows);
  };

  const handleSave = (airline, index) => {
    console.log("Saving airport:", airline);
    if (!airline.AirlineCode || !airline.AirlineName || !airline.LogoPath) {
      alert("❗ Please fill in all fields before saving.");
      return;
    }
  
    const isNew = !!airline.isNew;
  
    if (isNew) {
      axios.post("http://localhost:9999/api/airlines", airline)
        .then(() => {
          fetchAirlines();         // ✅ 전체 리스트를 다시 불러오면 중복 방지
          clearEditState(index);
        })
        .catch(() => alert("❌ Error saving airline."));
    } else {
      axios.put(`http://localhost:9999/api/airlines/${airline.AirlineCode}`, airline)
        .then(() => {
          fetchAirlines();         // ✅ 동일하게 전체 새로고침
          clearEditState(index);
        })
        .catch(() => alert("❌ Error updating airline."));
    }
  };

  const clearEditState = (index) => {
    const airline = filteredFlights[index]; // 화면 기준으로 접근
    const target = airlines.find(a => a.AirlineCode === airline.AirlineCode);
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

  

  const handleDelete = (airline, index) => {
    if (airline.isNew) {
      const updatedFiltered = [...filteredFlights];
      updatedFiltered.splice(index, 1);
      setFilteredFlights(updatedFiltered);
  
      const updatedAll = airlines.filter(a => a.AirlineCode !== airline.AirlineCode);
      setAirlines(updatedAll);
      clearEditState(index);
    } else {
      axios.delete(`http://localhost:9999/api/airlines/${airline.AirlineCode}`)
        .then(() => {
          setAirlines(prev => prev.filter(a => a.AirlineCode !== airline.AirlineCode));
          setFilteredFlights(prev => prev.filter(a => a.AirlineCode !== airline.AirlineCode));
          clearEditState(index);
        })
        .catch((err) => {
          console.error("❌ Delete error", err);
          alert("❌ Error deleting airline.");
        });
    }
  };

  return (

    <div className="flight-mgt-container">
      <div className="header-row">
        <h2>Airline Code Management</h2>
        <select value={search.code} onChange={(e) => setSearch({ ...search, code: e.target.value })}>
          <option value="">-- Code --</option>
          {[...new Set(airlines.map(a => a.AirlineCode))]
            .filter(Boolean)
            .sort()
            .map((code, i) => (
              <option key={i} value={code}>{code}</option>
            ))}
        </select>

        <select value={search.name} onChange={(e) => setSearch({ ...search, name: e.target.value })}>
          <option value="">-- Name --</option>
          {[...new Set(airlines.map(a => a.AirlineName))]
            .filter(Boolean)
            .sort()
            .map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
        </select>
        <button className="btn" onClick={handleSearch}>Search</button>
        <button className="btn" onClick={handleAddRow}>New</button>
      </div>

      <table className="flight-table">
        <thead>
          <tr>
            <th>Airline Code</th>
            <th>Airline Name </th>
            <th>LogoPath</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFlights.map((airline, index) => (
            <tr
              key={airline.id || index}
              className={editedRows.has(index) ? "highlight-row" : ""}
              onDoubleClick={() => setEdixtedRows(prev => new Set(prev).add(index))}
            >
              <td>
                {airline.isNew ? (
                  <input
                    value={airline.AirlineCode}
                    onChange={(e) => handleChange(index, "AirlineCode", e.target.value)}
                    style={{
                      fontWeight: editedCells.has(`${index}-AirlineCode`) ? "bold" : "normal"
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontWeight: editedCells.has(`${index}-AirlineCode`) ? "bold" : "normal"
                    }}
                  >
                    {airline.AirlineCode}
                  </span>
                )}
              </td>
              <td>
                <input
                  value={airline.AirlineName}
                  onChange={(e) => handleChange(index, "AirlineName", e.target.value)}
                  style={{
                    fontWeight: editedCells.has(`${index}-AirlineName`) ? "bold" : "normal"
                  }}
                />
              </td>
              <td>
                <input
                  value={airline.LogoPath}
                  onChange={(e) => handleChange(index, "LogoPath", e.target.value)}
                  style={{
                    fontWeight: editedCells.has(`${index}-LogoPath`) ? "bold" : "normal"
                  }}
                />
              </td>
              <td>
                <button className="btn-sm" onClick={() => handleSave(airline, index)}>Save</button>
                <button className="btn-sm danger" onClick={() => handleDelete(airline, index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CodeMgtAirline;
