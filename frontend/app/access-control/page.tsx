"use client"
import { useEffect, useState } from "react"

export default function AccessControlPage() {
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => { load() }, [])

  function load() {
    const raw = localStorage.getItem("access_requests")
    const ars = raw ? JSON.parse(raw) : []
    setRequests(ars)
  }

  function approve(id: string) {
    const raw = localStorage.getItem("access_requests")
    const ars = raw ? JSON.parse(raw) : []
    const found = ars.find((a:any)=>a.id===id)
    if (found) found.status = "approved"
    localStorage.setItem("access_requests", JSON.stringify(ars))
    // also update hrms_records status
    const hrRaw = localStorage.getItem("hrms_records")
    const hrs = hrRaw ? JSON.parse(hrRaw) : []
    const rec = hrs.find((r:any)=>r.id===id)
    if (rec) rec.status = "approved"
    localStorage.setItem("hrms_records", JSON.stringify(hrs))
    load()
    alert(`Approved ${id}`)
  }

  if (!requests.length) return <div style={{ padding: 24 }}><h1>Access Control</h1><p>No pending approvals.</p></div>

  return (
    <div style={{ padding: 24 }}>
      <h1>Access Control</h1>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>ID</th>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>Type</th>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>Status</th>
            <th style={{ border: "1px solid #ddd", padding: 6 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.id}>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>{r.id}</td>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>{r.type}</td>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>{r.status}</td>
              <td style={{ border: "1px solid #ddd", padding: 6 }}>
                {r.status === "pending" && <button onClick={() => approve(r.id)}>Approve</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
