"use client"
import { useEffect, useState } from "react"

export default function Records({ type }: { type: "employee" | "intern" }) {
  const [records, setRecords] = useState<any[]>([])

  useEffect(() => {
    const raw = localStorage.getItem("hrms_records")
    const all = raw ? JSON.parse(raw) : []
    setRecords(all.filter((r:any)=>r.type===type))
  }, [type])

  if (!records.length) return <div style={{ marginTop: 12 }}>No {type} records found.</div>

  return (
    <div style={{ marginTop: 12 }}>
      <h3>{type === "employee" ? "Employee" : "Intern"} Records</h3>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>ID</th>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>Summary</th>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map(r => (
            <tr key={r.id}>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>{r.id}</td>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>{r.type === "employee" ? `${r.data.firstName || ""} ${r.data.lastName || ""}` : r.data.studentName || ""}</td>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
