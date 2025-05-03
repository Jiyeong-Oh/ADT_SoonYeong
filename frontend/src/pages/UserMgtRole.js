import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FlightScheduleMgt.css";

const UserMgtRole = () => {
  const [roles, setRoles] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [editedCells, setEditedCells] = useState(new Set());
  const [editedRows, setEditedRows] = useState(new Set());

  const [search, setSearch] = useState({
    code: "",
    name: "",
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = () => {
    axios.get("http://localhost:9999/api/roles")
      .then(res => {
        setRoles(res.data);
        setFilteredFlights(res.data); 
      })
      .catch(err => console.error("❌ Error loading roles", err));
  };

  const handleSearch = () => {
    axios.get("http://localhost:9999/api/roles_filter", { params: search })
      .then(res => 
        {console.log("🛬 Search result:", res.data);  
          console.log(search);
          setFilteredFlights(res.data);})
      
      .catch(err => console.error("❌ Search error", err));
  };

  const handleAddRow = () => {
    const newRow = {
      RoleID: "",
      RoleName: "",
      isNew: true,
    };
  
    const newList = [...roles, newRow];   
    setRoles(newList);
    setFilteredFlights(newList);            
  };

  const handleChange = (index, field, value) => {
     
    const updatedFiltered = [...filteredFlights];
    updatedFiltered[index][field] = value;
    setFilteredFlights(updatedFiltered);
  
     
    const targetCode = updatedFiltered[index].RoleID;
    const updatedRoles = roles.map((role) =>
      role.RoleID === targetCode
        ? { ...role, [field]: value }
        : role
    );
    setRoles(updatedRoles);
  
     
    const updatedCells = new Set(editedCells);
    updatedCells.add(`${index}-${field}`);
    setEditedCells(updatedCells);
  
    const updatedRows = new Set(editedRows);
    updatedRows.add(index);
    setEditedRows(updatedRows);
  };

  const handleSave = (role, index) => {
    if (!role.RoleID || !role.RoleName) {
      alert("❗ Please fill in all fields before saving.");
      return;
    }
  
    const isNew = !!role.isNew;
  
    if (isNew) {
      axios.post("http://localhost:9999/api/roles", role)
        .then(() => {
          fetchRoles();          
          clearEditState(index);
        })
        .catch(() => alert("❌ Error saving role."));
    } else {
      axios.put(`http://localhost:9999/api/roles/${role.RoleID}`, role)
        .then(() => {
          fetchRoles();          
          clearEditState(index);
        })
        .catch(() => alert("❌ Error updating role."));
    }
  };

  const clearEditState = (index) => {
    const role = filteredFlights[index];  
    const target = roles.find(a => a.RoleID === role.RoleID);
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

  

  const handleDelete = (role, index) => {
    if (role.isNew) {
      const updatedFiltered = [...filteredFlights];
      updatedFiltered.splice(index, 1);
      setFilteredFlights(updatedFiltered);
  
      const updatedAll = roles.filter(a => a.RoleID !== role.RoleID);
      setRoles(updatedAll);
      clearEditState(index);
    } else {
      axios.delete(`http://localhost:9999/api/roles/${role.RoleID}`)
        .then(() => {
          setRoles(prev => prev.filter(a => a.RoleID !== role.RoleID));
          setFilteredFlights(prev => prev.filter(a => a.RoleID !== role.RoleID));
          clearEditState(index);
        })
        .catch((err) => {
          console.error("❌ Delete error", err);
          alert("❌ Error deleting role.");
        });
    }
  };

  return (

    <div className="flight-mgt-container">
      <div className="header-row">
        <h2>Role Management</h2>
        <select value={search.code} onChange={(e) => setSearch({ ...search, code: e.target.value })}>
          <option value="">-- Code --</option>
          {[...new Set(roles.map(a => a.RoleID))]
            .filter(Boolean)
            .sort()
            .map((code, i) => (
              <option key={i} value={code}>{code}</option>
            ))}
        </select>

        <select value={search.name} onChange={(e) => setSearch({ ...search, name: e.target.value })}>
          <option value="">-- Name --</option>
          {[...new Set(roles.map(a => a.RoleName))]
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
            <th>Role Code</th>
            <th>Role Name </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFlights.map((role, index) => (
            <tr
              key={role.id || index}
              className={editedRows.has(index) ? "highlight-row" : ""}
              onDoubleClick={() => setEdixtedRows(prev => new Set(prev).add(index))}
            >
              <td>
                {role.isNew ? (
                  <input
                    value={role.RoleID}
                    onChange={(e) => handleChange(index, "RoleID", e.target.value)}
                    style={{
                      fontWeight: editedCells.has(`${index}-RoleID`) ? "bold" : "normal"
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontWeight: editedCells.has(`${index}-RoleID`) ? "bold" : "normal"
                    }}
                  >
                    {role.RoleID}
                  </span>
                )}
              </td>
              <td>
                <input
                  value={role.RoleName}
                  onChange={(e) => handleChange(index, "RoleName", e.target.value)}
                  style={{
                    fontWeight: editedCells.has(`${index}-RoleName`) ? "bold" : "normal"
                  }}
                />
              </td>
              <td>
                <button className="btn-sm" onClick={() => handleSave(role, index)}>Save</button>
                <button className="btn-sm danger" onClick={() => handleDelete(role, index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserMgtRole;
