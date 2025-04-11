import { useState, useRef, useEffect } from 'react';
import '../styles/TimelineItem.css';

const TimelineItem = ({ item, timeRange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [itemName, setItemName] = useState(item.name);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null); // 'start', 'end', or 'move'
  const [itemDates, setItemDates] = useState({ start: item.start, end: item.end });
  
  const itemRef = useRef(null);
  const dragStartPosRef = useRef(null);
  const originalDatesRef = useRef({ start: item.start, end: item.end });

  // Calculate position and width of the item based on time range
  const calculatePosition = () => {
    const totalDays = Math.ceil((timeRange.end - timeRange.start) / (1000 * 60 * 60 * 24));
    const itemStart = new Date(itemDates.start);
    const itemEnd = new Date(itemDates.end);
    
    const startDays = Math.ceil((itemStart - timeRange.start) / (1000 * 60 * 60 * 24));
    const durationDays = Math.ceil((itemEnd - itemStart) / (1000 * 60 * 60 * 24)) + 1;
    
    const left = (startDays / totalDays) * 100;
    const width = (durationDays / totalDays) * 100;
    
    return { left: `${left}%`, width: `${width}%`, durationDays };
  };

  const { left, width, durationDays } = calculatePosition();

  // Determine duration class based on number of days
  const getDurationClass = () => {
    if (durationDays <= 3) return 'short-duration';
    if (durationDays <= 14) return 'medium-duration';
    return 'long-duration';
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e) => {
    setItemName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
    // Here you would add logic to save the name change
    if (itemName !== item.name) {
      console.log('Name updated:', {
        ...item,
        name: itemName
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (itemName !== item.name) {
        console.log('Name updated:', {
          ...item,
          name: itemName
        });
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setItemName(item.name); // Reset to original name
    }
  };

  const handleMouseDown = (e, type) => {
    setIsDragging(true);
    setDragType(type);
    // Store initial mouse position
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    // Store original dates for calculating changes
    originalDatesRef.current = { ...itemDates };
    
    // Prevent text selection during drag
    e.preventDefault();
    
    // Add listeners for movement and end of drag
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragStartPosRef.current) return;
    
    const deltaX = e.clientX - dragStartPosRef.current.x;
    const totalDays = Math.ceil((timeRange.end - timeRange.start) / (1000 * 60 * 60 * 24));
    const timelineWidth = itemRef.current?.parentElement.parentElement.scrollWidth || 1000;
    const daysPerPixel = totalDays / timelineWidth;
    const daysDelta = Math.round(deltaX * daysPerPixel);
    
    if (daysDelta === 0) return;
    
    const originalStart = new Date(originalDatesRef.current.start);
    const originalEnd = new Date(originalDatesRef.current.end);
    
    let newStart = new Date(originalStart);
    let newEnd = new Date(originalEnd);
    
    if (dragType === 'move') {
      // Move the entire item
      newStart.setDate(newStart.getDate() + daysDelta);
      newEnd.setDate(newEnd.getDate() + daysDelta);
    } else if (dragType === 'start') {
      // Adjust start date
      newStart.setDate(newStart.getDate() + daysDelta);
      // Ensure start date doesn't go beyond end date
      if (newStart > newEnd) {
        newStart = new Date(newEnd);
      }
    } else if (dragType === 'end') {
      // Adjust end date
      newEnd.setDate(newEnd.getDate() + daysDelta);
      // Ensure end date doesn't go before start date
      if (newEnd < newStart) {
        newEnd = new Date(newStart);
      }
    }
    
    // Format dates to YYYY-MM-DD
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    setItemDates({
      start: formatDate(newStart),
      end: formatDate(newEnd)
    });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragType(null);
      dragStartPosRef.current = null;
      
      // Remove listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Check if dates actually changed
      if (itemDates.start !== originalDatesRef.current.start || 
          itemDates.end !== originalDatesRef.current.end) {
        // Here you would add logic to save date changes
        console.log('Item updated:', {
          ...item,
          start: itemDates.start,
          end: itemDates.end
        });
      }
    }
  };

  // Clean up listeners when component unmounts
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Update local state if the prop changes
  useEffect(() => {
    setItemDates({ start: item.start, end: item.end });
  }, [item.start, item.end]);

  // Update local name if the prop changes
  useEffect(() => {
    setItemName(item.name);
  }, [item.name]);

  // Format dates for display
  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      ref={itemRef}
      className={`timeline-item ${getDurationClass()} ${isDragging ? 'dragging' : ''}`}
      style={{ left, width }}
      onDoubleClick={handleDoubleClick}
    >
      <div 
        className="timeline-item-resize-handle left"
        onMouseDown={(e) => handleMouseDown(e, 'start')}
        title="Drag to change start date"
      ></div>
      
      <div className="timeline-item-content">
        {isEditing ? (
          <input
            type="text"
            value={itemName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <div 
            className="timeline-item-name"
            onMouseDown={(e) => handleMouseDown(e, 'move')}
            title="Drag to move item"
          >
            {itemName}
          </div>
        )}
        <div className="timeline-item-dates">
          {formatDisplayDate(itemDates.start)} - {formatDisplayDate(itemDates.end)}
        </div>
      </div>
      
      <div 
        className="timeline-item-resize-handle right"
        onMouseDown={(e) => handleMouseDown(e, 'end')}
        title="Drag to change end date"
      ></div>
    </div>
  );
};

export default TimelineItem; 