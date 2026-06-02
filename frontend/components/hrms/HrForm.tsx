"use client"
import React, { useState } from "react"

type Props = {
  role: "employee" | "intern"
  onDone?: () => void
}

function nextEmpId(records: any[]) {
  const empRecords = records.filter(r => r.type === "employee")
  const next = empRecords.length + 1
  return `emp${String(next).padStart(3, "0")}`
}

export default function HrForm({ role, onDone }: Props) {
  const [form, setForm] = useState<any>({})

  function setField(k: string, v: any) { setForm((s: any) => ({ ...s, [k]: v })) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const raw = localStorage.getItem("hrms_records")
    const records = raw ? JSON.parse(raw) : []
    const id = role === "employee" ? nextEmpId(records) : `int${String(records.filter((r:any)=>r.type==="intern").length+1).padStart(3, "0")}`
    const record = { id, type: role, data: form, status: "pending", createdAt: new Date().toISOString() }
    records.push(record)
    localStorage.setItem("hrms_records", JSON.stringify(records))
    // also post an access request
    const arRaw = localStorage.getItem("access_requests")
    const ars = arRaw ? JSON.parse(arRaw) : []
    ars.push({ id, type: role, status: "pending", requestedAt: new Date().toISOString() })
    localStorage.setItem("access_requests", JSON.stringify(ars))
    alert(`${role === "employee" ? "Employee" : "Intern"} registered with id ${id}. Awaiting super admin approval.`)
    onDone && onDone()
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 12, display: "grid", gap: 8 }}>
      <h2>{role === "employee" ? "Add Employee" : "Add Intern"}</h2>
      <label>Role: {role}</label>

      {role === "employee" && (
        <>
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="First name" required onChange={e=>setField("firstName", e.target.value)} />
            <input placeholder="Last name" required onChange={e=>setField("lastName", e.target.value)} />
          </div>
          <input placeholder="Contact number" onChange={e=>setField("contact", e.target.value)} />
          <input placeholder="Email" type="email" onChange={e=>setField("email", e.target.value)} />
          <input placeholder="Address" onChange={e=>setField("address", e.target.value)} />
          <input placeholder="DOB" type="date" onChange={e=>setField("dob", e.target.value)} />
          <input placeholder="Emergency contact" onChange={e=>setField("emergencyContact", e.target.value)} />
          <input placeholder="Profile image (name)" onChange={e=>setField("profileImage", e.target.value)} />
          <input placeholder="Aadhar card" onChange={e=>setField("aadhar", e.target.value)} />
          <input placeholder="PAN number" onChange={e=>setField("pan", e.target.value)} />
          <input placeholder="National ID" onChange={e=>setField("nationalId", e.target.value)} />
          <input placeholder="Highest qualification" onChange={e=>setField("qualification", e.target.value)} />
          <input placeholder="College name" onChange={e=>setField("college", e.target.value)} />
          <input placeholder="Year of passing" onChange={e=>setField("yearOfPassing", e.target.value)} />
          <input placeholder="Certificate id" onChange={e=>setField("certificateId", e.target.value)} />
          <input placeholder="Marksheet id" onChange={e=>setField("marksheetId", e.target.value)} />
          <input placeholder="Previous company name" onChange={e=>setField("previousCompany", e.target.value)} />
          <select onChange={e=>setField("designation", e.target.value)}>
            <option value="">Select designation</option>
            <option>developer</option>
            <option>designer</option>
            <option>prompt engineer</option>
            <option>hr</option>
          </select>
          <input placeholder="Years of experience" onChange={e=>setField("experience", e.target.value)} />
          <input placeholder="Previous salary" onChange={e=>setField("previousSalary", e.target.value)} />
          <input placeholder="Expected salary" onChange={e=>setField("expectedSalary", e.target.value)} />
          <input placeholder="Reason for leaving" onChange={e=>setField("reasonForLeaving", e.target.value)} />
          <input placeholder="Previous company notice period" onChange={e=>setField("noticePeriod", e.target.value)} />

          <h3>Finance details</h3>
          <input placeholder="Holder name" onChange={e=>setField("bankHolder", e.target.value)} />
          <input placeholder="Bank account no" onChange={e=>setField("bankAccount", e.target.value)} />
          <input placeholder="IFSC code" onChange={e=>setField("ifsc", e.target.value)} />
          <input placeholder="Branch name" onChange={e=>setField("branch", e.target.value)} />
          <input placeholder="UPI id" onChange={e=>setField("upi", e.target.value)} />
          <textarea placeholder="EPF/ESI details" onChange={e=>setField("epfDetails", e.target.value)} />
        </>
      )}

      {role === "intern" && (
        <>
          <input placeholder="Student name" required onChange={e=>setField("studentName", e.target.value)} />
          <input placeholder="Register number" onChange={e=>setField("registerNumber", e.target.value)} />
          <input placeholder="College name" onChange={e=>setField("college", e.target.value)} />
          <label>Start date</label>
          <input type="date" onChange={e=>setField("startDate", e.target.value)} />
          <label>End date</label>
          <input type="date" onChange={e=>setField("endDate", e.target.value)} />
          <label>Domain</label>
          <select onChange={e=>setField("domain", e.target.value)}>
            <option value="">Select domain</option>
            <option>web development</option>
            <option>full stack</option>
            <option>python</option>
            <option>data analyst</option>
            <option>vibe coding</option>
            <option>ai prompting</option>
            <option>ui/ux</option>
          </select>
          <label>Price</label>
          <select onChange={e=>setField("price", e.target.value)}>
            <option value="">Select price</option>
            <option>25000</option>
            <option>5000</option>
            <option>8000</option>
            <option>15000</option>
            <option>25000</option>
          </select>
        </>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit">Submit</button>
        <button type="button" onClick={()=>{ localStorage.removeItem("hrms_records"); alert("Cleared demo records")}}>Clear demo</button>
      </div>
    </form>
  )
}
