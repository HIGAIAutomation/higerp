"use client";

import { Sidebar } from "./sidebar";
import { Search, Bell, Command } from "lucide-react";

export default function DashboardLayout({
  children,
  fullWidth = false,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-card border-b border-border flex items-center justify-between px-8">
          <div className="flex items-center w-96 glass border border-border rounded-xl px-4 py-2 text-muted-foreground">
            <Search className="h-4 w-4 mr-2" />
            <input 
              type="text" 
              placeholder="Search anything... (Cmd + K)" 
              className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
            />
            <Command className="h-4 w-4 ml-2 opacity-50" />
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-xl hover:bg-secondary relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full border-2 border-card"></span>
            </button>
            <div className="h-10 w-px bg-border mx-2"></div>
            <button className="px-4 py-2 bg-primary text-background text-sm font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20">
              New Project
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <div className={fullWidth ? "w-full" : "max-w-7xl mx-auto"}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
