import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FlightScheduleMgt.css";

const UserMgtUserRole = () => {
  const [userroles, setUserRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [editedCells, setEditedCells] = useState(new Set());
  const [editedRows, setEditedRows] = useState(new Set());

  const [search, setSearch] = useState({
    code: "",
    userid: "",
    roleid: "",
  });

  useEffect(() => {
    fetchUserRoles();
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = () => {
    axios
      .get("http://localhost:9999/api/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("❌ Error loading users", err));
  };

  const fetchRoles = () => {
    axios
      .get("http://localhost:9999/api/roles")
      .then((res) => setRoles(res.data))
      .catch((err) => console.error("❌ Error loading roles", err));
  };

  const fetchUserRoles = () => {
    axios.get("http://localhost:9999/api/userroles")
      .then(res => {
        setUserRoles(res.data);
        console.log(res.data);
        setFilteredFlights(res.data); 
      })
      .catch(err => console.error("❌ Error loading user roles", err));
  };


  const handleSearch = () => {
    axios.get("http://localhost:9999/api/userroles_filter", { params: search })
      .then(res => 
        {console.log("🛬 Search result:", res.data); // ✅ 여기서 데이터 확인!
          console.log(search);
          setFilteredFlights(res.data);})
      
      .catch(err => console.error("❌ Search error", err));
  };

  const handleAddRow = () => {
    // 1. 기존 ID 중 숫자만 추출하여 최대값 계산
    const existingIDs = userroles
      .map(u => u.UserRoleID)
      .filter(id => /^UR\d+$/.test(id)) // UR로 시작하고 숫자만 있는 경우
      .map(id => parseInt(id.replace("UR", ""), 10));
  
    const maxNum = existingIDs.length > 0 ? Math.max(...existingIDs) : 0;
    const nextNum = maxNum + 1;
  
    // 2. 새로운 ID 생성 (숫자 부분을 항상 2자리 이상으로 포맷)
    const newID = `UR${String(nextNum).padStart(2, '0')}`;  // 예: UR01, UR09, UR10
  
    // 3. 새 row 추가
    const newRow = {
      UserRoleID: newID,
      UserID: "",
      RoleID: "",
      isNew: true,
    };
  
    const newList = [...userroles, newRow];
    setUserRoles(newList);
    setFilteredFlights(newList);
  };
  // const handleAddRow = () => {
  //   const newRow = {
  //     UserRoleID: "",
  //     UserID: "",
  //     RoleID: "",
  //     isNew: true,
  //   };
  
  //   const newList = [...userroles, newRow];  // ✅ 먼저 새 배열 생성
  //   setUserRoles(newList);
  //   setFilteredFlights(newList);           // ✅ 둘 다 같은 리스트로 업데이트
  // };

  const handleChange = (index, field, value) => {
    // 1. filteredFlights 수정
    const updatedFiltered = [...filteredFlights];
    updatedFiltered[index][field] = value;
    setFilteredFlights(updatedFiltered);
  
    // 2. userroles 배열도 수정 (UserRoleID로 찾는 게 가장 안전)
    const targetCode = updatedFiltered[index].UserRoleID;
    const updatedUserRoles = userroles.map((userrole) =>
      userrole.UserRoleID === targetCode
        ? { ...userrole, [field]: value }
        : userrole
    );
    setUserRoles(updatedUserRoles);
  
    // 3. 수정 상태 관리
    const updatedCells = new Set(editedCells);
    updatedCells.add(`${index}-${field}`);
    setEditedCells(updatedCells);
  
    const updatedRows = new Set(editedRows);
    updatedRows.add(index);
    setEditedRows(updatedRows);
  };
  // ///////////////////////////////////////////////////////////////////////////////
  const handleSave = (userrole, index) => {
    console.log("🚀 Saving:", userrole);
    if (!userrole.UserRoleID || !userrole.RoleID || !userrole.UserID) {
      alert("❗ Please fill in all fields before saving.");
      return;
    }
  
    const isNew = !!userrole.isNew;
  
    if (isNew) {
      // console.log(userrole);
      axios.post("http://localhost:9999/api/userroles", userrole)
        .then(() => {
          fetchUsers();         // ✅ 전체 리스트를 다시 불러오면 중복 방지
          clearEditState(index);
        })
        .catch(() => alert("❌ Error saving userrole."));
    } else {
      // console.log(userrole);
      axios.put(`http://localhost:9999/api/userroles/${userrole.UserRoleID}`, userrole)
        .then(() => {
          fetchUsers();         // ✅ 동일하게 전체 새로고침
          clearEditState(index);
        })
        .catch(() => alert("❌ Error updating userrole."));
    }
  };

  const clearEditState = (index) => {
    const userrole = filteredFlights[index]; // 화면 기준으로 접근
    const target = userroles.find(a => a.UserRoleID === userrole.UserRoleID);
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

  

  const handleDelete = (userrole, index) => {
    if (userrole.isNew) {
      const updatedFiltered = [...filteredFlights];
      updatedFiltered.splice(index, 1);
      setFilteredFlights(updatedFiltered);
  
      const updatedAll = userroles.filter(a => a.UserRoleID !== userrole.UserRoleID);
      setUsers(updatedAll);
      clearEditState(index);
    } else {
      axios.delete(`http://localhost:9999/api/userroles/${userrole.UserRoleID}`)
        .then(() => {
          setUsers(prev => prev.filter(a => a.UserRoleID !== userrole.UserRoleID));
          setFilteredFlights(prev => prev.filter(a => a.UserRoleID !== userrole.UserRoleID));
          clearEditState(index);
        })
        .catch((err) => {
          console.error("❌ Delete error", err);
          alert("❌ Error deleting userrole.");
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
              value={search.userid}
              onChange={(e) => setSearch({ ...search, userid: e.target.value })}
            />
        <select
          value={search.roleid}
          onChange={(e) => setSearch({ ...search, roleid: e.target.value })}
        >
          <option value="">-- Role Name --</option>
          {[...new Map(roles.map(r => [r.RoleID, r.RoleName]))]
            .map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
        </select>
        <button className="btn" onClick={handleSearch}>Search</button>
        <button className="btn" onClick={handleAddRow}>New</button>
      </div>

      <table className="flight-table">
        <thead>
          <tr>
            <th>User Role ID</th>
            <th>User ID</th>
            <th>Role Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFlights.map((userrole, index) => (
            <tr
              key={userrole.id || index}
              className={editedRows.has(index) ? "highlight-row" : ""}
              onDoubleClick={() => setEdixtedRows(prev => new Set(prev).add(index))}
            >
              <td>
                {userrole.isNew ? (
                  <input
                    value={userrole.UserRoleID}
                    onChange={(e) => handleChange(index, "UserRoleID", e.target.value)}
                    style={{
                      fontWeight: editedCells.has(`${index}-UserRoleID`) ? "bold" : "normal"
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontWeight: editedCells.has(`${index}-UserRoleID`) ? "bold" : "normal"
                    }}
                  >
                    {userrole.UserRoleID}
                  </span>
                )}
              </td>
              <td>
                {userrole.isNew ? (
                  <select
                      value={users.UserID}
                      onChange={(e) =>
                        handleChange(index, "UserID", e.target.value)
                      }
                    >
                      <option value="">-- Select --</option>
                      {users.map((a) => (
                        <option
                          key={a.UserID}
                          value={a.UserID}
                        >
                          {a.UserID}
                        </option>
                      ))}
                    </select>
                ) : (
                  <span
                    style={{
                      fontWeight: editedCells.has(`${index}-UserID`) ? "bold" : "normal"
                    }}
                  >
                    {userrole.UserID}
                  </span>
                )}
              </td>
              <td>
              <select
                      value={userrole.RoleID}
                      onChange={(e) =>
                        handleChange(index, "RoleID", e.target.value)
                      }
                    >
                      <option value="">-- Select --</option>
                      {roles.map((a) => (
                        <option
                          key={a.RoleID}
                          value={a.RoleID}
                        >
                          {a.RoleName}
                        </option>
                      ))}
                    </select>
              </td>
              <td>
                <button className="btn-sm" onClick={() => handleSave(userrole, index)}>Save</button>
                <button className="btn-sm danger" onClick={() => handleDelete(userrole, index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserMgtUserRole;
