'use client';

import React, { createContext, useContext, useState, useRef } from 'react';
import { RotateCcw, X } from 'lucide-react';

interface UndoContextType {
  showUndo: (message: string, onUndo: () => Promise<void> | void) => void;
}

const UndoContext = createContext<UndoContextType | undefined>(undefined);

export const useUndo = () => {
  const context = useContext(UndoContext);
  if (!context) {
    throw new Error('useUndo must be used within an UndoProvider');
  }
  return context;
};

export const UndoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [undoCallback, setUndoCallback] = useState<(() => Promise<void> | void) | null>(null);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showUndo = (msg: string, onUndo: () => Promise<void> | void) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setMessage(msg);
    setUndoCallback(() => onUndo);
    setVisible(true);
    setLoading(false);

    // Auto hide after 8 seconds
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setUndoCallback(null);
    }, 8000);
  };

  const handleUndo = async () => {
    if (!undoCallback) return;
    try {
      setLoading(true);
      await undoCallback();
      setVisible(false);
      setUndoCallback(null);
    } catch (err) {
      console.error('Failed to perform undo operation', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setVisible(false);
    setUndoCallback(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return (
    <UndoContext.Provider value={{ showUndo }}>
      {children}
      {visible && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-card border border-border/80 text-foreground px-6 py-4 rounded-2xl shadow-xl flex items-center space-x-4 min-w-[320px] max-w-md backdrop-blur-md bg-opacity-95">
            <div className="flex-1">
              <p className="text-sm font-semibold tracking-tight">{message}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUndo}
                disabled={loading}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-accent hover:bg-accent/90 text-background rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Undo</span>
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </UndoContext.Provider>
  );
};
