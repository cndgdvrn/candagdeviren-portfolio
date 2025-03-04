import { createContext, useState, useEffect } from 'react';

export const TerminalContext = createContext();

export const TerminalProvider = ({ children }) => {
  const [showTerminal, setShowTerminal] = useState(true);

  const toggleTerminal = () => {
    setShowTerminal(prev => !prev);
  };

  const closeTerminal = () => {
    setShowTerminal(false);
  };

  return (
    <TerminalContext.Provider value={{ showTerminal, toggleTerminal, closeTerminal }}>
      {children}
    </TerminalContext.Provider>
  );
}; 