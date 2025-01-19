import React, { createContext, useContext, useState, useCallback } from 'react';
import type { DebugState } from '../types';

interface DebugContextType {
  debug: DebugState;
  toggleDebug: () => void;
  togglePanel: () => void;
  log: (type: 'info' | 'error' | 'warn', message: string, data?: any) => void;
  clearLogs: () => void;
}

const initialState: DebugState = {
  enabled: false,
  panelVisible: false,
  logs: []
};

const DebugContext = createContext<DebugContextType>({
  debug: initialState,
  toggleDebug: () => {},
  togglePanel: () => {},
  log: () => {},
  clearLogs: () => {}
});

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [debug, setDebug] = useState<DebugState>(initialState);

  const toggleDebug = useCallback(() => {
    setDebug(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const togglePanel = useCallback(() => {
    setDebug(prev => ({ ...prev, panelVisible: !prev.panelVisible }));
  }, []);

  const log = useCallback((type: 'info' | 'error' | 'warn', message: string, data?: any) => {
    setDebug(prev => ({
      ...prev,
      logs: [...prev.logs, { timestamp: new Date(), type, message, data }]
    }));
  }, []);

  const clearLogs = useCallback(() => {
    setDebug(prev => ({ ...prev, logs: [] }));
  }, []);

  return (
    <DebugContext.Provider value={{ debug, toggleDebug, togglePanel, log, clearLogs }}>
      {children}
    </DebugContext.Provider>
  );
}

export const useDebug = () => useContext(DebugContext);