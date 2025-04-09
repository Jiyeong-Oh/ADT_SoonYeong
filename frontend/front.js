import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const App = () => {
    const [rowData, setRowData] = useState([]);
    const [newFlight, setNewFlight] = useState({ flight: "", departure: "", arrival: "", status: "On Time" });

    // 데이터 로드
    useEffect(() => {
        fetch("http://localhost:5000/api/flights")
            .then((res) => res.json())
            .then((data) => setRowData(data));
    }, []);

    // 데이터 추가
    const addFlight = () => {
        fetch("http://localhost:5000/api/flights", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newFlight),
        })
            .then((res) => res.json())
            .then(() => window.location.reload()); // 새로고침하여 반영
    };

    // 데이터 삭제
    const deleteFlight = (id) => {
        fetch(`http://localhost:5000/api/flights/${id}`, { method: "DELETE" })
            .then(() => setRowData(rowData.filter((row) => row.id !== id)));
    };

    // 컬럼 정의
    const columnDefs = [
        { field: "flight", headerName: "항공편", sortable: true },
        { field: "departure", headerName: "출발 시간", sortable: true },
        { field: "arrival", headerName: "도착 시간", sortable: true },
        {
            field: "status",
            headerName: "상태",
            cellStyle: (params) => ({
                backgroundColor: params.value === "Delayed" ? "red" : "green",
                color: "white",
                fontWeight: "bold",
            }),
        },
        {
            headerName: "삭제",
            cellRenderer: (params) => (
                <button onClick={() => deleteFlight(params.data.id)}>삭제</button>
            ),
        },
    ];

    return (
        <div style={{ width: "80%", margin: "auto", padding: "20px" }}>
            <h2>항공기 스케줄 관리</h2>
            
            {/* 신규 데이터 입력 폼 */}
            <div style={{ marginBottom: "10px" }}>
                <input placeholder="항공편" onChange={(e) => setNewFlight({ ...newFlight, flight: e.target.value })} />
                <input placeholder="출발" onChange={(e) => setNewFlight({ ...newFlight, departure: e.target.value })} />
                <input placeholder="도착" onChange={(e) => setNewFlight({ ...newFlight, arrival: e.target.value })} />
                <select onChange={(e) => setNewFlight({ ...newFlight, status: e.target.value })}>
                    <option value="On Time">On Time</option>
                    <option value="Delayed">Delayed</option>
                </select>
                <button onClick={addFlight}>추가</button>
            </div>

            {/* AG Grid 테이블 */}
            <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
                <AgGridReact rowData={rowData} columnDefs={columnDefs} />
            </div>
        </div>
    );
};

export default App;
