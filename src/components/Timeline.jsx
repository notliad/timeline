import { useState, useEffect, useRef } from 'react';
import assignLanes from '../utils/assignLanes';
import TimelineItem from './TimelineItem';
import TimelineHeader from './TimelineHeader';
import '../styles/Timeline.css';

const Timeline = ({ items, darkMode }) => {
  const [lanes, setLanes] = useState([]);
  const [timeRange, setTimeRange] = useState({ start: null, end: null });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isEditingZoom, setIsEditingZoom] = useState(false);
  const [zoomInputValue, setZoomInputValue] = useState('100');
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  
  const timelineRef = useRef(null);
  const dragStartRef = useRef(null);
  const zoomInputRef = useRef(null);

  useEffect(() => {
    if (items && items.length > 0) {
      // Organize items into lanes using the assignLanes utility
      const assignedLanes = assignLanes(items);
      setLanes(assignedLanes);

      // Calculate the time range for the timeline
      const dates = items.flatMap(item => [new Date(item.start), new Date(item.end)]);
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      
      // Add a buffer of days before and after for better visualization
      minDate.setDate(minDate.getDate() - 5);
      maxDate.setDate(maxDate.getDate() + 5);
      
      setTimeRange({ start: minDate, end: maxDate });
    }
  }, [items]);

  // Zoom control
  const handleZoomIn = () => {
    const newZoom = zoomLevel + 0.05;
    setZoomLevel(newZoom);
    setZoomInputValue(Math.round(newZoom * 100).toString());
  };

  const handleZoomOut = () => {
    console.log(zoomLevel);
    const newZoom = zoomLevel - 0.05;
    if (newZoom < 0.45) {
      return;
    }
    setZoomLevel(newZoom);
    setZoomInputValue(Math.round(newZoom * 100).toString());
  };

  // Reset zoom
  const handleResetZoom = () => {
    setZoomLevel(1);
    setZoomInputValue('100');
  };

  // Handle zoom input change
  const handleZoomInputChange = (e) => {
    const value = e.target.value;
    setZoomInputValue(value);
  };

  // Apply custom zoom when input is submitted
  const handleZoomInputSubmit = () => {
    const numValue = parseInt(zoomInputValue, 10);
    
    if (!isNaN(numValue) && numValue >= 10 && numValue <= 500) {
      // Valid range: 10% to 500%
      const newZoom = numValue / 100;
      setZoomLevel(newZoom);
      setZoomInputValue(numValue.toString());
    } else {
      // If invalid, reset to current zoom level
      const currentZoomPercent = Math.round(zoomLevel * 100);
      setZoomInputValue(currentZoomPercent.toString());
      
      // Show brief error message (could be implemented with a toast notification)
      console.log(`Invalid zoom value. Please enter a number between 10 and 500.`);
    }
    
    setIsEditingZoom(false);
  };

  // Handle zoom input blur
  const handleZoomInputBlur = () => {
    handleZoomInputSubmit();
  };

  // Handle zoom input key press
  const handleZoomInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleZoomInputSubmit();
    } else if (e.key === 'Escape') {
      setZoomInputValue(Math.round(zoomLevel * 100).toString());
      setIsEditingZoom(false);
    }
  };

  // Enable zoom input editing mode
  const handleZoomLabelClick = () => {
    setIsEditingZoom(true);
    // Focus the input after it becomes visible
    setTimeout(() => {
      if (zoomInputRef.current) {
        zoomInputRef.current.focus();
        zoomInputRef.current.select();
      }
    }, 10);
  };

  // Timeline navigation
  const handleTimelineMouseDown = (e) => {
    if (e.target.classList.contains('timeline-wrapper') || 
        e.target.classList.contains('timeline-lanes')) {
      setIsDraggingTimeline(true);
      dragStartRef.current = {
        x: e.clientX,
        scrollLeft: timelineRef.current.scrollLeft
      };
      e.preventDefault();
      
      document.addEventListener('mousemove', handleTimelineMouseMove);
      document.addEventListener('mouseup', handleTimelineMouseUp);
    }
  };

  const handleTimelineMouseMove = (e) => {
    if (!isDraggingTimeline || !dragStartRef.current) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const newScrollLeft = dragStartRef.current.scrollLeft - deltaX;
    
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = newScrollLeft;
    }
  };

  const handleTimelineMouseUp = () => {
    setIsDraggingTimeline(false);
    dragStartRef.current = null;
    
    document.removeEventListener('mousemove', handleTimelineMouseMove);
    document.removeEventListener('mouseup', handleTimelineMouseUp);
  };

  // Clean up listeners when component unmounts
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleTimelineMouseMove);
      document.removeEventListener('mouseup', handleTimelineMouseUp);
    };
  }, []);

  // Center on a specific date
  const handleJumpToToday = () => {
    const today = new Date();
    if (timelineRef.current && timeRange.start && timeRange.end) {
      const totalDays = Math.ceil((timeRange.end - timeRange.start) / (1000 * 60 * 60 * 24));
      const dayWidth = timelineRef.current.scrollWidth / totalDays;
      const daysFromStart = Math.ceil((today - timeRange.start) / (1000 * 60 * 60 * 24));
      
      const scrollToPosition = dayWidth * daysFromStart - (timelineRef.current.clientWidth / 2);
      timelineRef.current.scrollLeft = scrollToPosition;
    }
  };

  if (!timeRange.start || !timeRange.end) {
    return <div className={`timeline-loading ${darkMode ? 'dark' : ''}`}>Loading timeline...</div>;
  }

  // Calculate total width in days
  const totalDays = Math.ceil((timeRange.end - timeRange.start) / (1000 * 60 * 60 * 24));
  
  return (
    <div className={`timeline-container ${darkMode ? 'dark' : ''}`}>
      <div className={`timeline-controls ${darkMode ? 'dark' : ''}`}>
        <div className="zoom-controls">
          <button onClick={handleZoomOut} title="Zoom out">-</button>
          
          {isEditingZoom ? (
            <input
              ref={zoomInputRef}
              type="text"
              className={`zoom-input ${darkMode ? 'dark' : ''}`}
              value={zoomInputValue}
              onChange={handleZoomInputChange}
              onBlur={handleZoomInputBlur}
              onKeyDown={handleZoomInputKeyDown}
              size="4"
              maxLength="4"
              aria-label="Custom zoom percentage (10-500%)"
            />
          ) : (
            <span 
              className={`zoom-label ${darkMode ? 'dark' : ''}`}
              onClick={handleZoomLabelClick} 
              title="Click to enter custom zoom level (10-500%)"
            >
              {zoomInputValue}%
            </span>
          )}
          
          <button onClick={handleZoomIn} title="Zoom in">+</button>
          <button onClick={handleResetZoom} title="Reset zoom">Reset</button>
        </div>
        
        <div className="navigation-controls">
          <button onClick={handleJumpToToday} title="Jump to today">Today</button>
        </div>
      </div>
      
      <div 
        ref={timelineRef}
        className={`timeline-wrapper ${isDraggingTimeline ? 'dragging' : ''} ${darkMode ? 'dark' : ''}`}
        style={{ cursor: isDraggingTimeline ? 'grabbing' : 'grab' }}
        onMouseDown={handleTimelineMouseDown}
      >
        <div className="timeline-inner" style={{ width: `${totalDays * 30 * zoomLevel}px` }}>
          <TimelineHeader start={timeRange.start} end={timeRange.end} zoomLevel={zoomLevel} darkMode={darkMode} />
          
          <div className="timeline-lanes">
            {lanes.map((lane, laneIndex) => (
              <div key={`lane-${laneIndex}`} className={`timeline-lane ${darkMode ? 'dark' : ''}`}>
                {lane.map(item => (
                  <TimelineItem 
                    key={item.id}
                    item={item}
                    timeRange={timeRange}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline; 