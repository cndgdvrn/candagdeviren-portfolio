import { useState, useEffect } from 'react';
import Tab from './Tab';
import styles from '../styles/Tabsbar.module.css';

const Tabsbar = () => {
  useEffect(() => {
    const handleAddTab = (event) => {
      const newTab = event.detail;
      setOpenTabs((prevTabs) => {
        if (!prevTabs.some(tab => tab.path === newTab.path)) {
          return [...prevTabs, newTab];
        }
        return prevTabs;
      });
    };

    window.addEventListener('addTab', handleAddTab);
    return () => window.removeEventListener('addTab', handleAddTab);
  }, []);

  const [openTabs, setOpenTabs] = useState([
    { icon: '/react_icon.svg', filename: 'home.jsx', path: '/' },
    { icon: '/html_icon.svg', filename: 'about.html', path: '/about' },
    { icon: '/css_icon.svg', filename: 'contact.css', path: '/contact' },
    { icon: '/markdown_icon.svg', filename: 'github.md', path: '/github' }
  ]);

  const handleCloseTab = (pathToClose) => {
    setOpenTabs(openTabs.filter(tab => tab.path !== pathToClose));
  };

  return (
    <div className={styles.tabs}>
      {openTabs.map((tab, index) => (
        <Tab
          key={index}
          icon={tab.icon}
          filename={tab.filename}
          path={tab.path}
          onClose={handleCloseTab}
        />
      ))}
    </div>
  );
};

export default Tabsbar;
