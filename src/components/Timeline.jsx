import { useState, useEffect, useRef } from 'react';
import assignLanes from '../utils/assignLanes';
import TimelineItem from './TimelineItem';
import TimelineHeader from './TimelineHeader';
import '../styles/Timeline.css';

const Timeline = ({ items }) => {
  const [lanes, setLanes] = useState([]);
  const [timeRange, setTimeRange] = useState({ start: null, end: null });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  
  const timelineRef = useRef(null);
  const dragStartRef = useRef(null);

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
    setZoomLevel(prevZoom => Math.min(prevZoom * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prevZoom => Math.max(prevZoom / 1.2, 0.3));
  };

  // Reset zoom
  const handleResetZoom = () => {
    setZoomLevel(1);
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
    return <div className="timeline-loading">Loading timeline...</div>;
  }

  // Calculate total width in days
  const totalDays = Math.ceil((timeRange.end - timeRange.start) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="timeline-container">
      <div className="timeline-controls">
        <div className="zoom-controls">
          <button onClick={handleZoomOut} title="Zoom out">-</button>
          <span>{Math.round(zoomLevel * 100)}%</span>
          <button onClick={handleZoomIn} title="Zoom in">+</button>
          <button onClick={handleResetZoom} title="Reset zoom">Reset</button>
        </div>
        
        <div className="navigation-controls">
          <button onClick={handleJumpToToday} title="Jump to today">Today</button>
        </div>
      </div>
      
      <div 
        ref={timelineRef}
        className={`timeline-wrapper ${isDraggingTimeline ? 'dragging' : ''}`}
        style={{ cursor: isDraggingTimeline ? 'grabbing' : 'grab' }}
        onMouseDown={handleTimelineMouseDown}
      >
        <div className="timeline-inner" style={{ width: `${totalDays * 30 * zoomLevel}px` }}>
          <TimelineHeader start={timeRange.start} end={timeRange.end} zoomLevel={zoomLevel} />
          
          <div className="timeline-lanes">
            {lanes.map((lane, laneIndex) => (
              <div key={`lane-${laneIndex}`} className="timeline-lane">
                {lane.map(item => (
                  <TimelineItem 
                    key={item.id}
                    item={item}
                    timeRange={timeRange}
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