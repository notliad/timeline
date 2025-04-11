# Timeline Visualization Component

A React component for visualizing items on a timeline with multiple interactive features.

## Installation and Setup

This project was built using Vite for a lightweight and simple build process.

```
# Clone the repository
git clone [repository-url]

# Navigate to the project directory
cd timeline

# Install dependencies
npm install

# Run the development server
npm run dev
```

## Features

- **Compact Timeline Layout**: Items are arranged in horizontal lanes efficiently, sharing lanes when possible
- **Item Editing**:
  - Modify item names inline
  - Change item dates
  - Adjust item duration
- **Timeline Navigation**:
  - Zoom in/out/reset capabilities
  - Jump to current date (or nearest date with content)
- **Visual Enhancements**:
  - Color coding based on item duration
  - Light/Dark mode support
  - Hover tooltips for small items showing full name and date information

## Usability Considerations

Special attention was paid to prevent accidental interactions:
- **Drag and Drop**: Items require an initial click before dragging to prevent unintended moves
- **Resize Operations**: Users must click on the desired edge before dragging to adjust duration

## Original Files Used

The following files from the original repository were utilized:
- `instructions.md` - Task instructions
- `assignLanes.js` - Lane division function (with minor modifications to export the function)
- `timelineItems.js` - Sample timeline data

## Development Reflections

### What I Like About My Implementation
The evolutionary nature of the project was particularly satisfying. Starting with a simple concept, the application naturally grew as I interacted with it, revealing opportunities for additional functionality.

### What I Would Change
If I were to start again, I would begin with a clean project as I eventually did after initial attempts with the starter code. While the starter code was helpful, my mind works better with a blank slate for this type of project.

### Design Decisions
The basic structure was informed by general knowledge of how generic timelines function. The rest evolved organically as I used the application and identified emerging needs.

### Testing Approach
Given more time, I would implement:
- Unit tests to verify correct text display in components
- Function tests for date formatting and calculations
- Tests for zoom levels to ensure proper time guide display
- Integration tests for user interactions like dragging and resizing 