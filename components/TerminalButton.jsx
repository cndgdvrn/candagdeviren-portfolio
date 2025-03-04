import { useContext, useEffect } from 'react';
import Terminal from './Terminal';
import styles from '../styles/TerminalButton.module.css';
import { TerminalContext } from '../contexts/TerminalContext';

const TerminalButton = () => {
  const { showTerminal, toggleTerminal, closeTerminal } = useContext(TerminalContext);

  // Klavye kısayolu (Ctrl+`) için
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.ctrlKey && e.key === '`') {
        toggleTerminal();
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [toggleTerminal]);

  return (
    <>
      <button 
        className={styles.terminalButton} 
        onClick={toggleTerminal}
        title="Terminal (Ctrl+`)"
      >
        <span className={styles.icon}>&#62;_</span>
      </button>
      {showTerminal && <Terminal onClose={closeTerminal} />}
    </>
  );
};

export default TerminalButton; 