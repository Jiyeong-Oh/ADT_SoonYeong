import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FlightScheduleMgt.css";

const UserMgtUser = () => {
  const [users, setUsers] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [airports, setAirports] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [editedCells, setEditedCells] = useState(new Set());
  const [editedRows, setEditedRows] = useState(new Set());

  const [search, setSearch] = useState({
    code: "",
    name: "",
    password: "",
    airline: "",
    airport: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchAirlines();
    fetchAirports();
  }, []);

  const fetchUsers = () => {
    axios.get("http://localhost:9999/api/users")
      .then(res => {
        setUsers(res.data);
        // console.log(res.data);
        setFilteredFlights(res.data); 
      })
      .catch(err => console.error("❌ Error loading users", err));
  };

  const fetchAirlines = () => {
    axios
      .get("http://localhost:9999/api/airlines")
      .then((res) => setAirlines(res.data))
      .catch((err) => console.error("❌ Error loading airlines", err));
  };

  const fetchAirports = () => {
    axios
      .get("http://localhost:9999/api/airports")
      .then((res) => setAirports(res.data))
      .catch((err) => console.error("❌ Error loading airports", err));
  };

  const handleSearch = () => {
    axios.get("http://localhost:9999/api/users_filter", { params: search })
      .then(res => 
        {console.log("🛬 Search result:", res.data); // ✅ 여기서 데이터 확인!
          console.log(search);
          setFilteredFlights(res.data);})
      
      .catch(err => console.error("❌ Search error", err));
  };

  const handleAddRow = () => {
    const newRow = {
      UserID: "",
      UserName: "",
      Password: "",
      AirlineCode: "",
      AirportCode: "",
      isNew: true,
    };
  
    const newList = [...users, newRow];  // ✅ 먼저 새 배열 생성
    setUsers(newList);
    setFilteredFlights(newList);           // ✅ 둘 다 같은 리스트로 업데이트
  };

  const handleChange = (index, field, value) => {
    // 1. filteredFlights 수정
    const updatedFiltered = [...filteredFlights];
    updatedFiltered[index][field] = value;
    setFilteredFlights(updatedFiltered);
  
    // 2. users 배열도 수정 (UserID로 찾는 게 가장 안전)
    const targetCode = updatedFiltered[index].UserID;
    const updatedUsers = users.map((user) =>
      user.UserID === targetCode
        ? { ...user, [field]: value }
        : user
    );
    setUsers(updatedUsers);
  
    // 3. 수정 상태 관리
    const updatedCells = new Set(editedCells);
    updatedCells.add(`${index}-${field}`);
    setEditedCells(updatedCells);
  
    const updatedRows = new Set(editedRows);
    updatedRows.add(index);
    setEditedRows(updatedRows);
  };

  const handleSave = (user, index) => {
    if (!user.UserID || !user.UserName) {
      alert("❗ Please fill in all fields before saving.");
      return;
    }
  
    const isNew = !!user.isNew;
  
    if (isNew) {
      // console.log(user);
      axios.post("http://localhost:9999/api/users", user)
        .then(() => {
          fetchUsers();         // ✅ 전체 리스트를 다시 불러오면 중복 방지
          clearEditState(index);
        })
        .catch(() => alert("❌ Error saving user."));
    } else {
      // console.log(user);
      axios.put(`http://localhost:9999/api/users/${user.UserID}`, user)
        .then(() => {
          fetchUsers();         // ✅ 동일하게 전체 새로고침
          clearEditState(index);
        })
        .catch(() => alert("❌ Error updating user."));
    }
  };

  const clearEditState = (index) => {
    const user = filteredFlights[index]; // 화면 기준으로 접근
    const target = users.find(a => a.UserID === user.UserID);
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

  

  const handleDelete = (user, index) => {
    if (user.isNew) {
      const updatedFiltered = [...filteredFlights];
      updatedFiltered.splice(index, 1);
      setFilteredFlights(updatedFiltered);
  
      const updatedAll = users.filter(a => a.UserID !== user.UserID);
      setUsers(updatedAll);
      clearEditState(index);
    } else {
      axios.delete(`http://localhost:9999/api/users/${user.UserID}`)
        .then(() => {
          setUsers(prev => prev.filter(a => a.UserID !== user.UserID));
          setFilteredFlights(prev => prev.filter(a => a.UserID !== user.UserID));
          clearEditState(index);
        })
        .catch((err) => {
          console.error("❌ Delete error", err);
          alert("❌ Error deleting user.");
        });
    }
  };

  return (

    <div className="flight-mgt-container">
      <div className="header-row">
        <h2>User Management</h2>
         <input
              className="search-input"
              placeholder="User ID"
              value={search.code}
              onChange={(e) => setSearch({ ...search, code: e.target.value })}
            />
        <input
              className="search-input"
              placeholder="User Name"
              value={search.name}
              onChange={(e) => setSearch({ ...search, name: e.target.value })}
            />
        <select
          value={search.airline}
          onChange={(e) => setSearch({ ...search, airline: e.target.value })}
        >
          <option value="">-- Airline --</option>
          {airlines.map((a) => (
            <option key={a.AirlineCode} value={a.AirlineCode}>
              {a.AirlineName}
            </option>
          ))}
        </select>
        <button className="btn" onClick={handleSearch}>Search</button>
        {/* <button className="btn" onClick={handleAddRow}>New</button> */}
      </div>

      <table className="flight-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>User Name</th>
            <th>Arline</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFlights.map((user, index) => (
            <tr
              key={user.id || index}
              className={editedRows.has(index) ? "highlight-row" : ""}
              onDoubleClick={() => setEdixtedRows(prev => new Set(prev).add(index))}
            >
              <td>
                {user.isNew ? (
                  <input
                    value={user.UserID}
                    onChange={(e) => handleChange(index, "UserID", e.target.value)}
                    style={{
                      fontWeight: editedCells.has(`${index}-UserID`) ? "bold" : "normal"
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontWeight: editedCells.has(`${index}-UserID`) ? "bold" : "normal"
                    }}
                  >
                    {user.UserID}
                  </span>
                )}
              </td>
              <td>
                <input
                  value={user.UserName}
                  onChange={(e) => handleChange(index, "UserName", e.target.value)}
                  style={{
                    fontWeight: editedCells.has(`${index}-UserName`) ? "bold" : "normal"
                  }}
                />
              </td>
              <td>
              <select
                      value={user.AirlineCode}
                      onChange={(e) =>
                        handleChange(index, "AirlineCode", e.target.value)
                      }
                    >
                      <option value="">-- Select --</option>
                      {airlines.map((a) => (
                        <option
                          key={a.AirlineCode}
                          value={a.AirlineCode}
                        >
                          {a.AirlineName}
                        </option>
                      ))}
                    </select>
              </td>
              <td>
                <button className="btn-sm" onClick={() => handleSave(user, index)}>Save</button>
                <button className="btn-sm danger" onClick={() => handleDelete(user, index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserMgtUser;
