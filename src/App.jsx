import { useState } from 'react';
import './App.css'
import Timeline from './components/Timeline'
import timelineItems from './timelineItems'

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="app-header">
        <div className="app-header-content">
          <h1>Timeline Visualizer</h1>s
        </div>
        <div className="theme-toggle">
          <button 
            className="theme-toggle-button" 
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>
      
      <main className="app-content">
        <Timeline items={timelineItems} darkMode={darkMode} />
      </main>
      
      <footer className="app-footer">
        <p>Airtable Timeline Challenge Implementation</p>
      </footer>
    </div>
  )
}

export default App
