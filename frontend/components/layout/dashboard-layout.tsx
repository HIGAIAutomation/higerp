"use client";

import { Bell, Command, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "./sidebar";

export default function DashboardLayout({
  children,
  fullWidth = false,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 md:hidden transform transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 md:h-20 bg-card border-b border-border flex items-center justify-between px-4 md:px-8 gap-2 md:gap-0">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-secondary rounded-xl"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Search Bar - Hidden on mobile, visible on md+ */}
          <div className="hidden md:flex items-center w-96 glass border border-border rounded-xl px-4 py-2 text-muted-foreground">
            <Search className="h-4 w-4 mr-2" />
            <input 
              type="text" 
              placeholder="Search anything... (Cmd + K)" 
              className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
            />
            <Command className="h-4 w-4 ml-2 opacity-50" />
          </div>

          {/* Mobile Search - Simplified for mobile */}
          <div className="md:hidden flex-1 max-w-xs flex items-center glass border border-border rounded-xl px-3 py-2 text-muted-foreground">
            <Search className="h-4 w-4 mr-2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-xs w-full text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="p-2 rounded-xl hover:bg-secondary relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full border-2 border-card"></span>
            </button>
            <div className="hidden md:block h-10 w-px bg-border" />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <div className={fullWidth ? "w-full" : "max-w-7xl mx-auto"}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
