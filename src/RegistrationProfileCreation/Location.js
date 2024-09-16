import React, { useState, useEffect, useRef } from "react";
import { ReactComponent as WorldIcon } from './world.svg'; 
import { Button } from "react-bootstrap";

const Location = ({ onClose, onSelectCoordinates, initialCoordinates }) => {
  const [dotPosition, setDotPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // Handle map click and derive coordinates
  const handleMapClick = (e) => {
    const svgElement = svgRef.current;
    const svgRect = svgElement.getBoundingClientRect();

    // Calculate the click position within the SVG
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
  
    // Get the SVG's viewBox
    const viewBox = svgElement.viewBox.baseVal;
    const scaleX = viewBox.width / svgRect.width;
    const scaleY = viewBox.height / svgRect.height;
  
    // Map the click position to the SVG's internal coordinate system
    const svgX = x * scaleX + viewBox.x;
    const svgY = y * scaleY + viewBox.y;
  
    // Calculate the coordinates as percentages within the SVG
    let xPercent = (svgX / viewBox.width) * 100;
    let yPercent = (svgY / viewBox.height) * 100;
  
    // Ensure xPercent and yPercent are within bounds (0-100)
    xPercent = Math.max(0, Math.min(100, xPercent));
    yPercent = Math.max(0, Math.min(100, yPercent));
  
    console.log("xPercent", xPercent);
    console.log("yPercent", yPercent);
  
    setDotPosition({ x: svgX, y: svgY });
    onSelectCoordinates({ x: xPercent, y: yPercent });
  };

  // Set initial dot position
  useEffect(() => {
    console.log("Initial coordinates received:", initialCoordinates);

    if (initialCoordinates) {
      const svgElement = svgRef.current;
      
      if (svgElement) {
        console.log("SVG element found:", svgElement);
        const viewBox = svgElement.viewBox.baseVal;
        console.log("SVG viewBox:", viewBox);
        
        // Convert the percentage-based coordinates to the viewBox's internal coordinate system
        const dotX = (initialCoordinates.x / 100) * viewBox.width;
        const dotY = (initialCoordinates.y / 100) * viewBox.height;

        console.log("Calculated dot position:", { x: dotX, y: dotY });

        // Set the dot position
        setDotPosition({ x: dotX, y: dotY });
      } else {
        console.error("SVG element not found.");
      }
    }
  }, [initialCoordinates]);

  // Inline styles for the component
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column', // Adjusted to align children vertically
    justifyContent: 'center',
    alignItems: 'center'
  };

  const containerStyle = {
    position: 'relative',
    width: '80%',
    maxWidth: '800px',
    background: 'white',
    padding: '20px',
    borderRadius: '20px',
    boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    // Adjust height to match the SVG's aspect ratio (assuming a 784.08:458.63 aspect ratio)
    height: 'calc(80vw * (458.63 / 784.08))', // Adjusted height based on the SVG's aspect ratio
    maxHeight: '500px' // Set a maximum height to fit within the viewport
  };

  const svgStyle = {
    width: '100%',
    height: '100%', // Adjusted to fill the container height
  };

  const buttonStyle = {
    marginTop: '0px', // Reduced margin to bring button closer
    marginBottom: '-10px', // Negative margin to pull the button even closer to the border
    backgroundColor: 'white'
  };

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={containerStyle}>
        <svg 
          ref={svgRef} // Assign the ref to the SVG element
          onClick={handleMapClick}
          style={svgStyle}
          viewBox="0 0 784.08 458.63" // Ensure to include the original viewBox to maintain aspect ratio
          preserveAspectRatio="xMidYMid meet" // Preserves the aspect ratio and centers the content
        >
          {/* Rectangle showing the clickable area */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="none"
            stroke="blue"
            strokeWidth="2"
          />
          {/* Add the world map */}
          <WorldIcon />
          {/* Add the red dot as an SVG circle */}
          {dotPosition.x !== 0 && dotPosition.y !== 0 && (
            <circle 
              cx={dotPosition.x} 
              cy={dotPosition.y} 
              r="5" 
              fill="red" 
            />
          )}
        </svg>
      </div>
      {/* Close button */}
      <Button
        variant="outline-info"
        className="btn-sm"
        onClick={onClose} // Call onClose to close the modal
        style={buttonStyle} // Adjusted to raise the button
      >
        Close
      </Button>
    </div>
  );
};

export default Location;
