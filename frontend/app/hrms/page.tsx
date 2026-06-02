"use client"
import { useState } from "react"
import HrForm from "../../components/hrms/HrForm"
import Records from "../../components/hrms/Records"

export default function HRMSPage() {
  const [view, setView] = useState<"menu" | "form" | "records">("menu")
  const [roleForForm, setRoleForForm] = useState<"employee" | "intern">("employee")
  const [recordType, setRecordType] = useState<"employee" | "intern">("employee")

  return (
    <div style={{ padding: 24 }}>
      <h1>HRMS & Talent Management</h1>
      {view === "menu" && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => { setRoleForForm("employee"); setView("form") }}>Add Employee</button>
          <button onClick={() => { setRoleForForm("intern"); setView("form") }}>Add Intern</button>
          <button onClick={() => { setRecordType("employee"); setView("records") }}>Employee Record</button>
          <button onClick={() => { setRecordType("intern"); setView("records") }}>Intern Record</button>
        </div>
      )}

      {view === "form" && (
        <div style={{ marginTop: 18 }}>
          <button onClick={() => setView("menu")}>Back</button>
          <HrForm role={roleForForm} onDone={() => setView("menu")} />
        </div>
      )}

      {view === "records" && (
        <div style={{ marginTop: 18 }}>
          <button onClick={() => setView("menu")}>Back</button>
          <Records type={recordType} />
        </div>
      )}
    </div>
  )
}
