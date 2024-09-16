import React, { useState, useEffect, useRef } from "react";
import { ReactComponent as WorldIcon } from './world.svg'; 

const LocationDisplay = ({ worldX, worldY }) => {
  const [dotPosition, setDotPosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // Set initial dot position
  useEffect(() => {
    console.log("worldX received:", worldX); // Log the initial coordinates
    console.log("worldY received:", worldY); // Log the initial coordinates

    if (worldX !== undefined && worldY !== undefined) {
      const svgElement = svgRef.current; // Use ref to access the SVG element
      if (svgElement) {
        console.log("SVG element found:", svgElement); // Log SVG element existence
        const viewBox = svgElement.viewBox.baseVal;
        console.log("SVG viewBox:", viewBox); // Log the viewBox details
        
        // Convert the percentage-based coordinates to the viewBox's internal coordinate system
        const dotX = (worldX / 100) * viewBox.width;
        const dotY = (worldY / 100) * viewBox.height;

        console.log("Calculated dot position:", { x: dotX, y: dotY }); // Log the calculated dot position

        // Set the dot position
        setDotPosition({ x: dotX, y: dotY });
      } else {
        console.error("SVG element not found."); // Log error if SVG is not found
      }
    }
  }, [worldX, worldY]);

  // Inline styles for the component
  const containerStyle = {
    position: 'relative',
    width: '100%', // Adjust width to fit the parent container
    maxWidth: '800px',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: 'auto', // Let the height adapt based on the content
  };

  const svgStyle = {
    width: '100%',
    height: 'auto', // Adjusted to maintain the aspect ratio automatically
  };

  // Style for the animation of the blue pointer
  const pointerStyle = {
    animation: "float-horizontal 2s ease-in-out infinite"
  };

  return (
    <div style={containerStyle}>
      <svg 
        ref={svgRef} // Assign the ref to the SVG element
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
        {/** Add the red dot as an SVG circle */}
        {dotPosition.x !== 0 && dotPosition.y !== 0 && (
          <>
            <circle 
              cx={dotPosition.x} 
              cy={dotPosition.y} 
              r="8" 
              fill="red" 
            />
            {/* Add the blue pointer with horizontal animation */}
            <g transform={`translate(${dotPosition.x - 40}, ${dotPosition.y - 10})`}>
              <polygon points="0,0 30,10 0,30" fill="blue" style={pointerStyle} />
            </g>
          </>
        )}
      </svg>
      {/* Inject the keyframes animation into the component */}
      <style>
        {`
          @keyframes float-horizontal {
            0%, 100% {
              transform: translateX(0);
            }
            50% {
              transform: translateX(10px);
            }
          }
        `}
      </style>
    </div>
  );
};

export default LocationDisplay;
