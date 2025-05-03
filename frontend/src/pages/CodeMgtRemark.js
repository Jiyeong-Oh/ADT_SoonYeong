import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FlightScheduleMgt.css";

const CodeMgtRemark = () => {
  const [remarks, setRemarks] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [editedCells, setEditedCells] = useState(new Set());
  const [editedRows, setEditedRows] = useState(new Set());

  const [search, setSearch] = useState({
    code: "",
    name: "",
    yn: "Y"
  });

  useEffect(() => {
    fetchRemarks();
  }, []);

  const fetchRemarks = () => {
    axios.get("http://localhost:9999/api/remarks")
      .then(res => {
        setRemarks(res.data);
        setFilteredFlights(res.data); 
      })
      .catch(err => console.error("❌ Error loading remarks", err));
  };

  const handleSearch = () => {
    axios.get("http://localhost:9999/api/remarks_filter", { params: search })
      .then(res => 
        {console.log("🛬 Search result:", res.data);  
          console.log(search);
          setFilteredFlights(res.data);})
      
      .catch(err => console.error("❌ Search error", err));
  };

  const handleAddRow = () => {
    const newRow = {
      RemarkCode: "",
      RemarkName: "",
      UseYn: "Y",
      isNew: true,
    };
  
    const newList = [...remarks, newRow];   
    setRemarks(newList);
    setFilteredFlights(newList);            
  };

  const handleChange = (index, field, value) => {
     
    const updatedFiltered = [...filteredFlights];
    updatedFiltered[index][field] = value;
    setFilteredFlights(updatedFiltered);
  
     
    const targetCode = updatedFiltered[index].RemarkCode;
    const updatedRemarks = remarks.map((remark) =>
      remark.RemarkCode === targetCode
        ? { ...remark, [field]: value }
        : remark
    );
    setRemarks(updatedRemarks);
  
     
    const updatedCells = new Set(editedCells);
    updatedCells.add(`${index}-${field}`);
    setEditedCells(updatedCells);
  
    const updatedRows = new Set(editedRows);
    updatedRows.add(index);
    setEditedRows(updatedRows);
  };

  const handleSave = (remark, index) => {
    if (!remark.RemarkCode || !remark.RemarkName) {
      alert("❗ Please fill in all fields before saving.");
      return;
    }
  
    const isNew = !!remark.isNew;
  
    if (isNew) {
      axios.post("http://localhost:9999/api/remarks", remark)
        .then(() => {
          fetchRemarks();          
          clearEditState(index);
        })
        .catch(() => alert("❌ Error saving remark."));
    } else {
      axios.put(`http://localhost:9999/api/remarks/${remark.RemarkCode}`, remark)
        .then(() => {
          fetchRemarks();          
          clearEditState(index);
        })
        .catch(() => alert("❌ Error updating remark."));
    }
  };

  const clearEditState = (index) => {
    const remark = filteredFlights[index];  
    const target = remarks.find(a => a.RemarkCode === remark.RemarkCode);
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

  

  const handleDelete = (remark, index) => {
    if (remark.isNew) {
      const updatedFiltered = [...filteredFlights];
      updatedFiltered.splice(index, 1);
      setFilteredFlights(updatedFiltered);
  
      const updatedAll = remarks.filter(a => a.RemarkCode !== remark.RemarkCode);
      setRemarks(updatedAll);
      clearEditState(index);
    } else {
      axios.delete(`http://localhost:9999/api/remarks/${remark.RemarkCode}`)
        .then(() => {
          setRemarks(prev => prev.filter(a => a.RemarkCode !== remark.RemarkCode));
          setFilteredFlights(prev => prev.filter(a => a.RemarkCode !== remark.RemarkCode));
          clearEditState(index);
        })
        .catch((err) => {
          console.error("❌ Delete error", err);
          alert("❌ Error deleting remark.");
        });
    }
  };

  return (

    <div className="flight-mgt-container">
      <div className="header-row">
        <h2>Remark Code Management</h2>
        <select value={search.code} onChange={(e) => setSearch({ ...search, code: e.target.value })}>
          <option value="">-- Code --</option>
          {[...new Set(remarks.map(a => a.RemarkCode))]
            .filter(Boolean)
            .sort()
            .map((code, i) => (
              <option key={i} value={code}>{code}</option>
            ))}
        </select>

        <select value={search.name} onChange={(e) => setSearch({ ...search, name: e.target.value })}>
          <option value="">-- Name --</option>
          {[...new Set(remarks.map(a => a.RemarkName))]
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
            <th>Remark Code</th>
            <th>Remark Name </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFlights.map((remark, index) => (
            <tr
              key={remark.id || index}
              className={editedRows.has(index) ? "highlight-row" : ""}
              onDoubleClick={() => setEdixtedRows(prev => new Set(prev).add(index))}
            >
              <td>
                {remark.isNew ? (
                  <input
                    value={remark.RemarkCode}
                    onChange={(e) => handleChange(index, "RemarkCode", e.target.value)}
                    style={{
                      fontWeight: editedCells.has(`${index}-RemarkCode`) ? "bold" : "normal"
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontWeight: editedCells.has(`${index}-RemarkCode`) ? "bold" : "normal"
                    }}
                  >
                    {remark.RemarkCode}
                  </span>
                )}
              </td>
              <td>
                <input
                  value={remark.RemarkName}
                  onChange={(e) => handleChange(index, "RemarkName", e.target.value)}
                  style={{
                    fontWeight: editedCells.has(`${index}-RemarkName`) ? "bold" : "normal"
                  }}
                />
              </td>
              <td>
                <button className="btn-sm" onClick={() => handleSave(remark, index)}>Save</button>
                <button className="btn-sm danger" onClick={() => handleDelete(remark, index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CodeMgtRemark;
