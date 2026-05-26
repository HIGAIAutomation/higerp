"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { DashboardStats } from "@/components/dashboard/stats";
import { useAuth } from "@/components/providers/auth-provider";
import { FileText, Clock, CheckCircle2, Briefcase, DollarSign } from "lucide-react";

const recentDocs = [
  { name: "SOW - Project Alpha.pdf", type: "Statement of Work", date: "2 mins ago", status: "Generated" },
  { name: "NDA - Global Tech.pdf", type: "NDA", date: "15 mins ago", status: "Signed" },
  { name: "Invoice #8291.pdf", type: "Invoice", date: "1 hour ago", status: "Sent" },
  { name: "Offer Letter - Sarah.pdf", type: "Offer Letter", date: "3 hours ago", status: "Generated" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">System Overview</h1>
          <p className="text-muted-foreground mt-1 font-inter">
            Welcome back, <span className="font-bold text-primary">{user?.username || 'Guest'}</span>. Here's what's happening today.
          </p>
        </div>

        {/* Profile & Designation Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card rounded-3xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Designation</p>
              <h3 className="text-lg font-bold text-primary mt-0.5">
                {user?.designation || (
                  <span className="text-muted-foreground italic font-normal">Pending Designation Allocation</span>
                )}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
            <div className="p-4 bg-accent/10 rounded-2xl text-accent">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Compensation</p>
              <h3 className="text-lg font-bold text-primary mt-0.5">
                {user?.salary ? (
                  `$${Number(user.salary).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                ) : (
                  <span className="text-muted-foreground italic font-normal">Pending Salary Calculation</span>
                )}
              </h3>
            </div>
          </div>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Automated Documents */}
          <div className="lg:col-span-2 bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">Recent Automation</h2>
              <button className="text-sm font-semibold text-accent hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {recentDocs.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between p-4 rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors">
                  <div className="flex items-center">
                    <div className="p-3 bg-card border border-border rounded-xl shadow-sm mr-4">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-primary text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-xs font-bold text-emerald-500 mb-1">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {doc.status}
                    </div>
                    <p className="text-[10px] text-muted-foreground flex items-center justify-end">
                      <Clock className="h-3 w-3 mr-1" />
                      {doc.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="bg-primary rounded-3xl p-8 text-background shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp size={120} />
            </div>
            <h2 className="text-xl font-bold mb-4">AI Insights</h2>
            <div className="space-y-6 relative z-10">
              <div className="p-4 rounded-2xl bg-background/10 backdrop-blur-md border border-background/10">
                <p className="text-sm font-semibold text-accent mb-1">Revenue Forecast</p>
                <p className="text-xs text-background/70">Projected 12% growth next month based on current CRM pipeline.</p>
              </div>
              <div className="p-4 rounded-2xl bg-background/10 backdrop-blur-md border border-background/10">
                <p className="text-sm font-semibold text-accent mb-1">Support Load</p>
                <p className="text-xs text-background/70">Ticket volume is down 5%. AI summaries have saved 14 hours of agent time.</p>
              </div>
              <button className="w-full py-3 rounded-xl bg-accent text-primary font-bold text-sm hover:scale-[1.02] transition-transform">
                Generate Full Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function TrendingUp({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
