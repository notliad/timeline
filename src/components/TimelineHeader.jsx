import '../styles/TimelineHeader.css';

const TimelineHeader = ({ start, end, zoomLevel, darkMode }) => {
  // Generate an array of dates between start and end date
  const generateDates = () => {
    const dates = [];
    const currentDate = new Date(start);
    const endDate = new Date(end);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const dates = generateDates();
  const totalDays = dates.length;
  
  // Determine which date markers to show based on zoom level
  const getDateMarkersToShow = () => {
    // Low zoom, show first day of each month
    if (zoomLevel < 0.5) {
      return dates.filter((date) => date.getDate() === 1 || date.getTime() === dates[0].getTime());
    } else if (zoomLevel < 1) {
      // Medium zoom, show first day of month and every 15th day
      return dates.filter((date) => 
        date.getDate() === 1 || 
        date.getDate() % 5 === 0 || 
        date.getTime() === dates[0].getTime()
      );
    }
    
    // Normal or high zoom, show first day of month and every 5th day
    return dates.filter((date) => 
      date.getDate() === 1 || 
      date.getDate() % 5 === 0 || 
      date.getTime() === dates[0].getTime()
    );
  };

  const dateMarkersToShow = getDateMarkersToShow();
  
  // Format date for display - now showing month and year
  const formatDate = (date) => {
    // If it's the first day of the month, show month and year
    if (date.getDate() === 1) {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    
    // For other days, depends on zoom level
    if (zoomLevel > 1.5) {
      // High zoom, show day number
      return date.toLocaleDateString('en-US', { day: 'numeric' });
    } else if (date.getDate() % 5 === 0) {
      // Medium zoom, show day number for 5th, 10th, etc.
      return date.toLocaleDateString('en-US', { day: 'numeric' });
    } else {
      // Otherwise show nothing
      return '';
    }
  };

  const isFirstDayOfMonth = (date) => {
    return date.getDate() === 1;
  };

  const isFifthDay = (date) => {
    return date.getDate() % 5 === 0;
  };

  return (
    <div className={`timeline-header ${darkMode ? 'dark' : ''}`}>
      <div className="timeline-dates">
        {dateMarkersToShow.map((date) => {
          const position = (dates.findIndex(d => d.getTime() === date.getTime()) / totalDays) * 100;
          const isMonth = isFirstDayOfMonth(date);
          const isFifth = isFifthDay(date);
          
          return (
            <div 
              key={date.toISOString()} 
              className={`timeline-date-marker ${isMonth ? 'month-marker' : isFifth ? 'fifth-day-marker' : 'day-marker'} ${darkMode ? 'dark' : ''}`}
              style={{ left: `${position}%` }}
            >
              <div className={`timeline-date-line ${isMonth ? 'month-line' : isFifth ? 'fifth-day-line' : ''} ${darkMode ? 'dark' : ''}`}></div>
              <div className={`timeline-date-label ${isMonth ? 'month-label' : isFifth ? 'fifth-day-label' : ''} ${darkMode ? 'dark' : ''}`}>
                {formatDate(date)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineHeader; 