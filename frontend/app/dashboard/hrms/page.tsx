"use client";

import OfferLetterModal from '@/components/hrms/offer-letter-modal';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import {
    AlertCircle,
    BookOpen,
    Briefcase,
    Calendar,
    CheckCircle2,
    ChevronDown,
    Clock,
    CreditCard,
    Download,
    FileCheck,
    FileText,
    GraduationCap,
    Hash,
    IndianRupee,
    Loader2,
    Mail,
    MapPin,
    PlusCircle,
    User,
    UserPlus,
    Users,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  joiningDate: string;
  status: string;
  salaryBasis: string;
  profDocNumber?: string;
  documents?: any[];
  metadata?: any;
}

export default function HRMSPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmpDocs, setSelectedEmpDocs] = useState<Employee | null>(null);
  const [selectedEmpDetails, setSelectedEmpDetails] = useState<Employee | null>(null);
  const [selectedEmpOfferLetter, setSelectedEmpOfferLetter] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  
  // View mode state: 'employee-records' | 'intern-records' | 'add-employee' | 'add-intern'
  const [viewMode, setViewMode] = useState<'employee-records' | 'intern-records' | 'add-employee' | 'add-intern'>('employee-records');

  // Employee Form State (matching registration fields)
  const [employeeForm, setEmployeeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    emergencyContact: '',
    dob: '',
    address: '',
    designation: 'developer',
    experience: '',
    joiningDate: new Date().toISOString().split('T')[0],
    profDocNumber: '',
    aadhar: '',
    pan: '',
    qualification: '',
    college: '',
    yearOfPassing: '',
    previousCompany: '',
    previousSalary: '',
    salaryBasis: '',
    reasonForLeaving: '',
    noticePeriod: '',
    bankHolder: '',
    bankAccount: '',
    ifsc: '',
    branch: '',
    upi: '',
    epfDetails: '',
  });

  // Intern Form State (matching registration fields)
  const [internForm, setInternForm] = useState({
    studentName: '',
    email: '',
    registerNumber: '',
    college: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
    domain: 'web development',
    price: '8000',
    dob: '',
    address: '',
  });

  // Success response from creation (contains auto-generated docs)
  const [onboardingDocs, setOnboardingDocs] = useState<any[]>([]);

  const handleDownloadDoc = async (docId: string, docName: string) => {
    const { downloadPdf } = await import('@/lib/download-pdf');
    await downloadPdf(docId, docName, setDownloadingDocId);
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/hrms/employees');
      setEmployees(data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      // Fallback mocks
      setEmployees([
        { 
          id: '1', 
          firstName: 'Sarah', 
          lastName: 'Connor', 
          email: 'sarah@hig.ai', 
          designation: 'AI Research Director', 
          joiningDate: '2026-04-10', 
          status: 'active', 
          salaryBasis: '85000',
          metadata: { roleType: 'employee' }
        },
        { 
          id: '2', 
          firstName: 'John', 
          lastName: 'Doe', 
          email: 'john@hig.ai', 
          designation: 'Senior AI Engineer', 
          joiningDate: '2026-05-01', 
          status: 'active', 
          salaryBasis: '62000',
          metadata: { roleType: 'employee' }
        },
        { 
          id: '3', 
          firstName: 'Gopika', 
          lastName: 'P', 
          email: 'gopika@hig.ai', 
          designation: 'web development', 
          joiningDate: '2026-06-01', 
          status: 'active', 
          salaryBasis: '8000',
          metadata: { roleType: 'intern', college: 'Tirunelveli University', endDate: '2026-09-01' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setOnboardingDocs([]);
      
      const payload = {
        firstName: employeeForm.firstName,
        lastName: employeeForm.lastName,
        email: employeeForm.email,
        designation: employeeForm.designation,
        salaryBasis: parseFloat(employeeForm.salaryBasis) || 0,
        joiningDate: new Date(employeeForm.joiningDate).toISOString(),
        profDocNumber: employeeForm.profDocNumber || employeeForm.aadhar || employeeForm.pan || '',
        metadata: {
          roleType: 'employee',
          ...employeeForm
        }
      };

      const result = await fetchWithAuth('/hrms/employees', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (result.documents) {
        setOnboardingDocs(result.documents);
      }
      
      // Reset form
      setEmployeeForm({
        firstName: '',
        lastName: '',
        email: '',
        contact: '',
        emergencyContact: '',
        dob: '',
        address: '',
        designation: 'developer',
        experience: '',
        joiningDate: new Date().toISOString().split('T')[0],
        profDocNumber: '',
        aadhar: '',
        pan: '',
        qualification: '',
        college: '',
        yearOfPassing: '',
        previousCompany: '',
        previousSalary: '',
        salaryBasis: '',
        reasonForLeaving: '',
        noticePeriod: '',
        bankHolder: '',
        bankAccount: '',
        ifsc: '',
        branch: '',
        upi: '',
        epfDetails: '',
      });

      await fetchEmployees();
      setViewMode('employee-records');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setError('Failed to onboard employee. Please make sure the backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInternSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setOnboardingDocs([]);

      const payload = {
        firstName: internForm.studentName,
        lastName: '',
        email: internForm.email,
        designation: internForm.domain,
        salaryBasis: parseFloat(internForm.price) || 0,
        joiningDate: new Date(internForm.startDate).toISOString(),
        profDocNumber: internForm.registerNumber,
        metadata: {
          roleType: 'intern',
          ...internForm
        }
      };

      const result = await fetchWithAuth('/hrms/employees', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (result.documents) {
        setOnboardingDocs(result.documents);
      }

      // Reset form
      setInternForm({
        studentName: '',
        email: '',
        registerNumber: '',
        college: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
        domain: 'web development',
        price: '8000',
        dob: '',
        address: '',
      });

      await fetchEmployees();
      setViewMode('intern-records');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setError('Failed to onboard intern. Please make sure the backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter employees and interns
  const employeeRecords = employees.filter(emp => emp.metadata?.roleType !== 'intern');
  const internRecords = employees.filter(emp => emp.metadata?.roleType === 'intern');

  return (
    <DashboardLayout>
      <div className="space-y-8 font-sans">
        
        {/* Header and Dropdown Selection */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-3xl border border-border shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">HRMS & Talent Management</h1>
            <p className="text-muted-foreground mt-1 text-sm font-inter">Manage employee & intern lifecycle and trigger legal onboarding documentation.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Select Mode</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:border-accent hover:border-accent/50 transition-all cursor-pointer appearance-none pr-10"
            >
              <option value="employee-records">👥 Employee Records</option>
              <option value="intern-records">🎓 Intern Records</option>
              <option value="add-employee">➕ Add Employee</option>
              <option value="add-intern">➕ Add Intern</option>
            </select>
            <div className="absolute right-4 bottom-3.5 pointer-events-none text-muted-foreground">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center border border-rose-500/20 animate-in fade-in">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Auto-generated Onboarding Docs Feed */}
        {onboardingDocs.length > 0 && (
          <div className="bg-primary text-background rounded-3xl p-8 shadow-xl animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-6 border-b border-background/10 pb-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-accent animate-pulse" />
                <div>
                  <h2 className="text-xl font-bold">Generated Onboarding Suite</h2>
                  <p className="text-xs text-background/50">Documents dynamically compiled and ready in database</p>
                </div>
              </div>
              <button 
                onClick={() => setOnboardingDocs([])}
                className="text-background/60 hover:text-background p-1.5 rounded-lg hover:bg-background/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {onboardingDocs.map((doc: any, index: number) => (
                <div key={index} className="p-4 rounded-2xl bg-background/5 border border-background/10 flex items-center justify-between hover:bg-background/10 transition-colors">
                  <div className="flex items-center">
                    <div className="p-2 bg-accent/20 rounded-lg mr-3">
                      <FileText className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-background max-w-[180px] truncate">{doc.name || 'Onboarding Document'}</p>
                      <p className="text-[10px] text-background/50">Status: {doc.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Generated
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1. EMPLOYEE RECORDS TABLE VIEW */}
        {viewMode === 'employee-records' && (
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-bold text-primary">Employee Directory</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">List of active and registered employee records</p>
                </div>
              </div>
              <span className="text-xs bg-secondary text-primary font-bold px-3 py-1 rounded-full border border-border">
                Total Employees: {employeeRecords.length}
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-accent mb-2" />
                <p className="text-sm text-muted-foreground">Loading employees...</p>
              </div>
            ) : employeeRecords.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground italic">
                No employee records found.
              </div>
            ) : (
              <div className="font-inter">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-[10px] font-bold text-muted-foreground tracking-wider uppercase bg-secondary/10">
                        <th className="pb-4 pt-2 px-3">Name</th>
                        <th className="pb-4 pt-2 px-3">Email</th>
                        <th className="pb-4 pt-2 px-3">Designation</th>
                        <th className="pb-4 pt-2 px-3">Prof Doc #</th>
                        <th className="pb-4 pt-2 px-3">Joined Date</th>
                        <th className="pb-4 pt-2 px-3">Salary Basis</th>
                        <th className="pb-4 pt-2 px-3">Status</th>
                        <th className="pb-4 pt-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      {employeeRecords.map((emp) => (
                        <tr key={emp.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-4 px-3 font-bold text-primary">{emp.firstName} {emp.lastName}</td>
                          <td className="py-4 px-3 text-muted-foreground">{emp.email}</td>
                          <td className="py-4 px-3 font-medium text-foreground/80 capitalize">{emp.designation}</td>
                          <td className="py-4 px-3 text-muted-foreground font-mono text-xs">{emp.profDocNumber || '—'}</td>
                          <td className="py-4 px-3 text-muted-foreground">{emp.joiningDate ? emp.joiningDate.split('T')[0] : 'N/A'}</td>
                          <td className="py-4 px-3 font-bold text-primary">₹{Number(emp.salaryBasis).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="py-4 px-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 capitalize">
                              {emp.status}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setSelectedEmpDetails(emp)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-accent/10 hover:text-accent text-primary font-bold rounded-xl border border-border text-xs transition-colors cursor-pointer"
                              >
                                <User className="h-3.5 w-3.5" />
                                Details
                              </button>
                              <button
                                onClick={() => setSelectedEmpDocs(emp)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-accent/10 hover:text-accent text-primary font-bold rounded-xl border border-border text-xs transition-colors cursor-pointer"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Docs
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List View */}
                <div className="md:hidden space-y-4">
                  {employeeRecords.map((emp) => (
                    <div key={emp.id} className="p-5 bg-secondary/20 border border-border rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-primary text-base">{emp.firstName} {emp.lastName}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{emp.designation}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 capitalize">
                          {emp.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs border-y border-border/50 py-3 text-muted-foreground">
                        <div>
                          <span className="block text-[10px] font-bold text-muted-foreground/60 uppercase">Joined</span>
                          <span className="font-semibold text-foreground/80">{emp.joiningDate ? emp.joiningDate.split('T')[0] : 'N/A'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-muted-foreground/60 uppercase">Salary</span>
                          <span className="font-bold text-primary">₹{Number(emp.salaryBasis).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="block text-[10px] font-bold text-muted-foreground/60 uppercase">Email</span>
                          <span className="font-medium text-foreground/80 break-all">{emp.email}</span>
                        </div>
                        {emp.profDocNumber && (
                          <div className="col-span-2">
                            <span className="block text-[10px] font-bold text-muted-foreground/60 uppercase">Doc ID</span>
                            <span className="font-mono text-foreground/80">{emp.profDocNumber}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setSelectedEmpDetails(emp)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-secondary hover:bg-accent/10 hover:text-accent text-primary font-bold rounded-xl border border-border text-xs transition-colors cursor-pointer"
                        >
                          <User className="h-3.5 w-3.5" />
                          Details
                        </button>
                        <button
                          onClick={() => setSelectedEmpDocs(emp)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-secondary hover:bg-accent/10 hover:text-accent text-primary font-bold rounded-xl border border-border text-xs transition-colors cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Docs
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. INTERN RECORDS TABLE VIEW */}
        {viewMode === 'intern-records' && (
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-bold text-primary">Intern Directory</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">List of active and registered interns</p>
                </div>
              </div>
              <span className="text-xs bg-secondary text-primary font-bold px-3 py-1 rounded-full border border-border">
                Total Interns: {internRecords.length}
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-accent mb-2" />
                <p className="text-sm text-muted-foreground">Loading interns...</p>
              </div>
            ) : internRecords.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground italic">
                No intern records found.
              </div>
            ) : (
              <div className="font-inter">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-[10px] font-bold text-muted-foreground tracking-wider uppercase bg-secondary/10">
                        <th className="pb-4 pt-2 px-3">Student Name</th>
                        <th className="pb-4 pt-2 px-3">Email</th>
                        <th className="pb-4 pt-2 px-3">Domain</th>
                        <th className="pb-4 pt-2 px-3">College</th>
                        <th className="pb-4 pt-2 px-3">Reg. Number</th>
                        <th className="pb-4 pt-2 px-3">Start Date</th>
                        <th className="pb-4 pt-2 px-3">End Date</th>
                        <th className="pb-4 pt-2 px-3">Stipend</th>
                        <th className="pb-4 pt-2 px-3">Status</th>
                        <th className="pb-4 pt-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      {internRecords.map((emp) => (
                        <tr key={emp.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-4 px-3 font-bold text-primary">{emp.firstName}</td>
                          <td className="py-4 px-3 text-muted-foreground">{emp.email}</td>
                          <td className="py-4 px-3 font-medium text-foreground/80 capitalize">{emp.designation}</td>
                          <td className="py-4 px-3 text-muted-foreground truncate max-w-[150px]">{emp.metadata?.college || '—'}</td>
                          <td className="py-4 px-3 text-muted-foreground font-mono text-xs">{emp.profDocNumber || '—'}</td>
                          <td className="py-4 px-3 text-muted-foreground">{emp.joiningDate ? emp.joiningDate.split('T')[0] : 'N/A'}</td>
                          <td className="py-4 px-3 text-muted-foreground">{emp.metadata?.endDate || '—'}</td>
                          <td className="py-4 px-3 font-bold text-primary">₹{Number(emp.salaryBasis).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="py-4 px-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 capitalize">
                              {emp.status}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setSelectedEmpDetails(emp)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-accent/10 hover:text-accent text-primary font-bold rounded-xl border border-border text-xs transition-colors cursor-pointer"
                              >
                                <User className="h-3.5 w-3.5" />
                                Details
                              </button>
                              <button
                                onClick={() => setSelectedEmpDocs(emp)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-accent/10 hover:text-accent text-primary font-bold rounded-xl border border-border text-xs transition-colors cursor-pointer"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Docs
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List View */}
                <div className="md:hidden space-y-4">
                  {internRecords.map((emp) => (
                    <div key={emp.id} className="p-5 bg-secondary/20 border border-border rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-primary text-base">{emp.firstName}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{emp.designation}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 capitalize">
                          {emp.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs border-y border-border/50 py-3 text-muted-foreground">
                        <div>
                          <span className="block text-[10px] font-bold text-muted-foreground/60 uppercase">College</span>
                          <span className="font-semibold text-foreground/80 truncate block max-w-[140px]">{emp.metadata?.college || '—'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-muted-foreground/60 uppercase">Stipend</span>
                          <span className="font-bold text-primary">₹{Number(emp.salaryBasis).toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-muted-foreground/60 uppercase">Start Date</span>
                          <span className="font-semibold text-foreground/80">{emp.joiningDate ? emp.joiningDate.split('T')[0] : 'N/A'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-muted-foreground/60 uppercase">End Date</span>
                          <span className="font-semibold text-foreground/80">{emp.metadata?.endDate || '—'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="block text-[10px] font-bold text-muted-foreground/60 uppercase">Email</span>
                          <span className="font-medium text-foreground/80 break-all">{emp.email}</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setSelectedEmpDetails(emp)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-secondary hover:bg-accent/10 hover:text-accent text-primary font-bold rounded-xl border border-border text-xs transition-colors cursor-pointer"
                        >
                          <User className="h-3.5 w-3.5" />
                          Details
                        </button>
                        <button
                          onClick={() => setSelectedEmpDocs(emp)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-secondary hover:bg-accent/10 hover:text-accent text-primary font-bold rounded-xl border border-border text-xs transition-colors cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Docs
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. ADD EMPLOYEE FORM VIEW */}
        {viewMode === 'add-employee' && (
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-center space-x-3 mb-6 border-b border-border pb-4">
              <UserPlus className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold text-primary">Add Employee</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Register a new employee with complete profile and banking information.</p>
              </div>
            </div>

            <form onSubmit={handleEmployeeSubmit} className="space-y-8 font-inter">
              
              {/* Section 1: Personal Profile */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-500" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-secondary/10 p-6 rounded-2xl border border-border">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">FIRST NAME *</label>
                    <input
                      required
                      type="text"
                      placeholder="Enter first name"
                      value={employeeForm.firstName}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, firstName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">LAST NAME *</label>
                    <input
                      required
                      type="text"
                      placeholder="Enter last name"
                      value={employeeForm.lastName}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, lastName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">EMAIL ADDRESS *</label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 text-muted-foreground h-4 w-4" />
                      <input
                        required
                        type="email"
                        placeholder="name@hig.ai"
                        value={employeeForm.email}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">CONTACT NUMBER</label>
                    <input
                      type="text"
                      placeholder="Contact phone"
                      value={employeeForm.contact}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, contact: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">EMERGENCY CONTACT</label>
                    <input
                      type="text"
                      placeholder="Emergency contact"
                      value={employeeForm.emergencyContact}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, emergencyContact: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">DATE OF BIRTH</label>
                    <div className="relative flex items-center">
                      <Calendar className="absolute left-3 text-muted-foreground h-4 w-4" />
                      <input
                        type="date"
                        value={employeeForm.dob}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, dob: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">ADDRESS</label>
                    <div className="relative flex items-start">
                      <MapPin className="absolute left-3 top-3.5 text-muted-foreground h-4 w-4" />
                      <textarea
                        rows={2}
                        placeholder="Street Address, City, State, ZIP"
                        value={employeeForm.address}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Professional Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-indigo-500" />
                  Professional Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-secondary/10 p-6 rounded-2xl border border-border">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">DESIGNATION *</label>
                    <div className="relative flex items-center">
                      <Briefcase className="absolute left-3 text-muted-foreground h-4 w-4" />
                      <select
                        value={employeeForm.designation}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, designation: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground appearance-none cursor-pointer"
                      >
                        <option value="developer">Developer</option>
                        <option value="designer">Designer</option>
                        <option value="prompt engineer">Prompt Engineer</option>
                        <option value="hr">HR</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">SALARY BASIS (MONTHLY INR) *</label>
                    <div className="relative flex items-center">
                      <IndianRupee className="absolute left-3 text-muted-foreground h-4 w-4" />
                      <input
                        required
                        type="number"
                        placeholder="e.g. 15000"
                        value={employeeForm.salaryBasis}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, salaryBasis: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">JOINING DATE *</label>
                    <div className="relative flex items-center">
                      <Calendar className="absolute left-3 text-muted-foreground h-4 w-4" />
                      <input
                        required
                        type="date"
                        value={employeeForm.joiningDate}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, joiningDate: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">PROF DOC NUMBER / ID</label>
                    <div className="relative flex items-center">
                      <Hash className="absolute left-3 text-muted-foreground h-4 w-4" />
                      <input
                        type="text"
                        placeholder="e.g. PAN / Aadhaar / Employee ID"
                        value={employeeForm.profDocNumber}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, profDocNumber: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">AADHAR NUMBER</label>
                    <input
                      type="text"
                      placeholder="12 digit Aadhaar"
                      value={employeeForm.aadhar}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, aadhar: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">PAN NUMBER</label>
                    <input
                      type="text"
                      placeholder="10 digit PAN"
                      value={employeeForm.pan}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, pan: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">YEARS OF EXPERIENCE</label>
                    <input
                      type="text"
                      placeholder="e.g. 3 years"
                      value={employeeForm.experience}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, experience: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">PREVIOUS COMPANY</label>
                    <input
                      type="text"
                      placeholder="Company name"
                      value={employeeForm.previousCompany}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, previousCompany: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">PREVIOUS SALARY</label>
                    <input
                      type="text"
                      placeholder="Monthly INR"
                      value={employeeForm.previousSalary}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, previousSalary: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">NOTICE PERIOD</label>
                    <input
                      type="text"
                      placeholder="e.g. 30 days"
                      value={employeeForm.noticePeriod}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, noticePeriod: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">REASON FOR LEAVING</label>
                    <input
                      type="text"
                      placeholder="Reason"
                      value={employeeForm.reasonForLeaving}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, reasonForLeaving: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Education */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  Education Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-secondary/10 p-6 rounded-2xl border border-border">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">HIGHEST QUALIFICATION</label>
                    <input
                      type="text"
                      placeholder="e.g. B.Tech CSE"
                      value={employeeForm.qualification}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, qualification: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">COLLEGE NAME</label>
                    <input
                      type="text"
                      placeholder="University / College"
                      value={employeeForm.college}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, college: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">YEAR OF PASSING</label>
                    <input
                      type="text"
                      placeholder="YYYY"
                      value={employeeForm.yearOfPassing}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, yearOfPassing: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Finance & Banking Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-indigo-500" />
                  Banking &amp; Payroll details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-secondary/10 p-6 rounded-2xl border border-border">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">HOLDER NAME</label>
                    <input
                      type="text"
                      placeholder="Account holder name"
                      value={employeeForm.bankHolder}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, bankHolder: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">BANK ACCOUNT NUMBER</label>
                    <input
                      type="text"
                      placeholder="Account number"
                      value={employeeForm.bankAccount}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, bankAccount: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">IFSC CODE</label>
                    <input
                      type="text"
                      placeholder="e.g. SBIN0001234"
                      value={employeeForm.ifsc}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, ifsc: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">BANK BRANCH</label>
                    <input
                      type="text"
                      placeholder="Branch location"
                      value={employeeForm.branch}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, branch: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">UPI ID</label>
                    <input
                      type="text"
                      placeholder="username@bank"
                      value={employeeForm.upi}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, upi: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">EPF / ESI DETAILS</label>
                    <input
                      type="text"
                      placeholder="Universal Account Number (UAN) / ESI"
                      value={employeeForm.epfDetails}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, epfDetails: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-primary text-background font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-primary/10 disabled:opacity-70 disabled:hover:scale-100 text-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Adding Employee...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Onboard &amp; Generate Documents
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* 4. ADD INTERN FORM VIEW */}
        {viewMode === 'add-intern' && (
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-center space-x-3 mb-6 border-b border-border pb-4">
              <GraduationCap className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold text-primary">Add Intern</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Register a new intern with college credentials and internship specifications.</p>
              </div>
            </div>

            <form onSubmit={handleInternSubmit} className="space-y-8 font-inter">
              
              {/* Section 1: Intern Profile */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-500" />
                  Student &amp; Academic Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-secondary/10 p-6 rounded-2xl border border-border">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">STUDENT FULL NAME *</label>
                    <input
                      required
                      type="text"
                      placeholder="Enter student name"
                      value={internForm.studentName}
                      onChange={(e) => setInternForm({ ...internForm, studentName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">EMAIL ADDRESS *</label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 text-muted-foreground h-4 w-4" />
                      <input
                        required
                        type="email"
                        placeholder="name@hig.ai"
                        value={internForm.email}
                        onChange={(e) => setInternForm({ ...internForm, email: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">REGISTER NUMBER *</label>
                    <div className="relative flex items-center">
                      <Hash className="absolute left-3 text-muted-foreground h-4 w-4" />
                      <input
                        required
                        type="text"
                        placeholder="University Roll / Register No."
                        value={internForm.registerNumber}
                        onChange={(e) => setInternForm({ ...internForm, registerNumber: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">COLLEGE NAME *</label>
                    <input
                      required
                      type="text"
                      placeholder="College / Institution"
                      value={internForm.college}
                      onChange={(e) => setInternForm({ ...internForm, college: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground placeholder-muted-foreground/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">DATE OF BIRTH</label>
                    <div className="relative flex items-center">
                      <Calendar className="absolute left-3 text-muted-foreground h-4 w-4" />
                      <input
                        type="date"
                        value={internForm.dob}
                        onChange={(e) => setInternForm({ ...internForm, dob: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">ADDRESS</label>
                    <div className="relative flex items-start">
                      <MapPin className="absolute left-3 top-3.5 text-muted-foreground h-4 w-4" />
                      <textarea
                        rows={2}
                        placeholder="Street Address, City, State, ZIP"
                        value={internForm.address}
                        onChange={(e) => setInternForm({ ...internForm, address: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Internship Duration & Stipend */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  Internship Duration &amp; Stipend
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-secondary/10 p-6 rounded-2xl border border-border">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">DOMAIN / DESIGNATION *</label>
                    <div className="relative flex items-center">
                      <Briefcase className="absolute left-3 text-muted-foreground h-4 w-4" />
                      <select
                        value={internForm.domain}
                        onChange={(e) => setInternForm({ ...internForm, domain: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground appearance-none cursor-pointer"
                      >
                        <option value="web development">Web Development</option>
                        <option value="full stack">Full Stack</option>
                        <option value="python">Python</option>
                        <option value="data analyst">Data Analyst</option>
                        <option value="vibe coding">Vibe Coding</option>
                        <option value="ai prompting">AI Prompting</option>
                        <option value="ui/ux">UI/UX</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">STIPEND (MONTHLY INR) *</label>
                    <div className="relative flex items-center">
                      <IndianRupee className="absolute left-3 text-muted-foreground h-4 w-4" />
                      <select
                        value={internForm.price}
                        onChange={(e) => setInternForm({ ...internForm, price: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground appearance-none cursor-pointer"
                      >
                        <option value="5000">₹5,000.00</option>
                        <option value="8000">₹8,000.00</option>
                        <option value="15000">₹15,000.00</option>
                        <option value="25000">₹25,000.00</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">START DATE *</label>
                    <div className="relative flex items-center">
                      <Calendar className="absolute left-3 text-muted-foreground h-4 w-4" />
                      <input
                        required
                        type="date"
                        value={internForm.startDate}
                        onChange={(e) => setInternForm({ ...internForm, startDate: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">END DATE *</label>
                    <div className="relative flex items-center">
                      <Calendar className="absolute left-3 text-muted-foreground h-4 w-4" />
                      <input
                        required
                        type="date"
                        value={internForm.endDate}
                        onChange={(e) => setInternForm({ ...internForm, endDate: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-sm text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-primary text-background font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-primary/10 disabled:opacity-70 disabled:hover:scale-100 text-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Adding Intern...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Onboard &amp; Generate Documents
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>

      {/* Document Downloader Modal */}
      {selectedEmpDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-lg rounded-3xl p-6 border border-border shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedEmpDocs(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-xl font-bold text-primary mb-1">Onboarding Documents</h3>
            <p className="text-xs text-muted-foreground mb-4 font-semibold font-inter">
              Manage and download legal documents for {selectedEmpDocs.firstName} {selectedEmpDocs.lastName}
            </p>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {!selectedEmpDocs.documents || selectedEmpDocs.documents.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-6 font-semibold font-inter">No documents generated yet.</p>
              ) : (
                selectedEmpDocs.documents.map((doc: any) => (
                  <div key={doc.id} className="p-3.5 rounded-2xl bg-secondary/50 border border-border flex items-center justify-between font-inter">
                    <div>
                      <p className="text-xs font-bold text-foreground">{doc.template?.name || doc.name || 'Document'}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold">Status: {doc.status}</p>
                    </div>
                    <button
                      onClick={() => handleDownloadDoc(doc.id, doc.template?.name || doc.name || 'document')}
                      disabled={downloadingDocId === doc.id}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-primary text-background font-bold rounded-xl hover:scale-[1.03] active:scale-[0.97] transition-all text-xs shadow-sm disabled:opacity-75 cursor-pointer"
                    >
                      {downloadingDocId === doc.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Download
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedEmpDocs(null)}
                className="px-5 py-2.5 bg-secondary text-primary font-bold rounded-xl border border-border hover:bg-secondary/80 transition-colors text-xs cursor-pointer font-inter"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedEmpDetails && (() => {
        const isIntern = selectedEmpDetails.metadata?.roleType === 'intern';
        const meta = selectedEmpDetails.metadata || {};
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-card w-full max-w-2xl rounded-3xl p-8 border border-border shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedEmpDetails(null)}
                className="absolute top-6 right-6 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="flex items-center space-x-4 border-b border-border pb-6 mb-6">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-bold uppercase">
                  {selectedEmpDetails.firstName ? selectedEmpDetails.firstName.substring(0, 2) : 'EM'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">
                    {selectedEmpDetails.firstName} {selectedEmpDetails.lastName || ''}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground font-semibold capitalize">
                      {selectedEmpDetails.designation || 'No Designation'}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-border" />
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isIntern 
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {isIntern ? 'Intern' : 'Employee'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable details content */}
              <div className="overflow-y-auto space-y-8 pr-2 flex-1 scrollbar-thin">
                
                {/* 1. General Profile */}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3.5">
                    <User className="h-4 w-4 text-indigo-500" />
                    Personal &amp; Contact Info
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/20 p-5 rounded-2xl border border-border/60 text-xs">
                    <div>
                      <p className="text-muted-foreground font-bold">Email Address</p>
                      <p className="text-primary font-semibold mt-0.5 break-all">{selectedEmpDetails.email || '—'}</p>
                    </div>
                    {!isIntern && (
                      <>
                        <div>
                          <p className="text-muted-foreground font-bold">Contact Number</p>
                          <p className="text-primary font-semibold mt-0.5">{meta.contact || '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-bold">Emergency Contact</p>
                          <p className="text-primary font-semibold mt-0.5">{meta.emergencyContact || '—'}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-muted-foreground font-bold">Date of Birth</p>
                      <p className="text-primary font-semibold mt-0.5">{meta.dob || '—'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-muted-foreground font-bold">Home Address</p>
                      <p className="text-primary font-semibold mt-0.5 leading-relaxed">{meta.address || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Employment/Academic Details */}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3.5">
                    <Briefcase className="h-4 w-4 text-indigo-500" />
                    {isIntern ? 'Internship Details' : 'Professional Profile'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/20 p-5 rounded-2xl border border-border/60 text-xs">
                    {isIntern ? (
                      <>
                        <div>
                          <p className="text-muted-foreground font-bold">College / Institution</p>
                          <p className="text-primary font-semibold mt-0.5">{meta.college || '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-bold">University Register No.</p>
                          <p className="text-primary font-semibold mt-0.5 font-mono">{selectedEmpDetails.profDocNumber || '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-bold">Domain / Track</p>
                          <p className="text-primary font-semibold mt-0.5 capitalize">{selectedEmpDetails.designation || '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-bold">Monthly Stipend</p>
                          <p className="text-primary font-bold mt-0.5">₹{Number(selectedEmpDetails.salaryBasis || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-bold">Start Date</p>
                          <p className="text-primary font-semibold mt-0.5">{selectedEmpDetails.joiningDate ? selectedEmpDetails.joiningDate.split('T')[0] : '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-bold">End Date</p>
                          <p className="text-primary font-semibold mt-0.5">{meta.endDate || '—'}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-muted-foreground font-bold">Official Role</p>
                          <p className="text-primary font-semibold mt-0.5 capitalize">{selectedEmpDetails.designation || '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-bold">Joined Date</p>
                          <p className="text-primary font-semibold mt-0.5">{selectedEmpDetails.joiningDate ? selectedEmpDetails.joiningDate.split('T')[0] : '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-bold">Monthly Salary (Base)</p>
                          <p className="text-primary font-bold mt-0.5">₹{Number(selectedEmpDetails.salaryBasis || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-bold">Professional Document #</p>
                          <p className="text-primary font-semibold mt-0.5 font-mono">{selectedEmpDetails.profDocNumber || '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-bold">Aadhaar Card No.</p>
                          <p className="text-primary font-semibold mt-0.5 font-mono">{meta.aadhar || '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-bold">PAN Card No.</p>
                          <p className="text-primary font-semibold mt-0.5 font-mono">{meta.pan || '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-bold">Prior Experience</p>
                          <p className="text-primary font-semibold mt-0.5">{meta.experience || '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-bold">Previous Company</p>
                          <p className="text-primary font-semibold mt-0.5">{meta.previousCompany || '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-bold">Previous Salary</p>
                          <p className="text-primary font-semibold mt-0.5">{meta.previousSalary || '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-bold">Notice Period</p>
                          <p className="text-primary font-semibold mt-0.5">{meta.noticePeriod || '—'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-muted-foreground font-bold">Reason for Leaving</p>
                          <p className="text-primary font-semibold mt-0.5">{meta.reasonForLeaving || '—'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Education Details (Employee Only) */}
                {!isIntern && (
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3.5">
                      <BookOpen className="h-4 w-4 text-indigo-500" />
                      Academic Records
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-secondary/20 p-5 rounded-2xl border border-border/60 text-xs">
                      <div>
                        <p className="text-muted-foreground font-bold">Highest Degree / Qualification</p>
                        <p className="text-primary font-semibold mt-0.5">{meta.qualification || '—'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-bold">College / University</p>
                        <p className="text-primary font-semibold mt-0.5">{meta.college || '—'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-bold">Passing Year</p>
                        <p className="text-primary font-semibold mt-0.5">{meta.yearOfPassing || '—'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Banking & EPF Details (Employee Only) */}
                {!isIntern && (
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3.5">
                      <CreditCard className="h-4 w-4 text-indigo-500" />
                      Banking &amp; Payroll Setup
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/20 p-5 rounded-2xl border border-border/60 text-xs">
                      <div>
                        <p className="text-muted-foreground font-bold">Account Holder Name</p>
                        <p className="text-primary font-semibold mt-0.5">{meta.bankHolder || '—'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-bold">Account Number</p>
                        <p className="text-primary font-semibold mt-0.5 font-mono">{meta.bankAccount || '—'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-bold">IFSC Code</p>
                        <p className="text-primary font-semibold mt-0.5 font-mono">{meta.ifsc || '—'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-bold">Bank Branch</p>
                        <p className="text-primary font-semibold mt-0.5">{meta.branch || '—'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-bold">UPI Alias (ID)</p>
                        <p className="text-primary font-semibold mt-0.5">{meta.upi || '—'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-bold">EPF / ESI Identifiers</p>
                        <p className="text-primary font-semibold mt-0.5">{meta.epfDetails || '—'}</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-end border-t border-border pt-4">
                <button
                  onClick={() => setSelectedEmpDetails(null)}
                  className="px-6 py-2.5 bg-secondary text-primary font-bold rounded-xl border border-border hover:bg-secondary/80 transition-colors text-xs cursor-pointer font-inter"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Offer Letter Modal */}
      {selectedEmpOfferLetter && (
        <OfferLetterModal
          isOpen={selectedEmpOfferLetter !== null}
          employeeId={selectedEmpOfferLetter || ''}
          onClose={() => setSelectedEmpOfferLetter(null)}
        />
      )}
    </DashboardLayout>
  );
}
