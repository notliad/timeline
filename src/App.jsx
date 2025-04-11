import './App.css'
import Timeline from './components/Timeline'
import timelineItems from './timelineItems'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Timeline Visualizer</h1>
        <p>View your events on an interactive timeline</p>
      </header>
      
      <main className="app-content">
        <Timeline items={timelineItems} />
      </main>
      
      <footer className="app-footer">
        <p>Airtable Timeline Challenge Implementation</p>
      </footer>
    </div>
  )
}

export default App
