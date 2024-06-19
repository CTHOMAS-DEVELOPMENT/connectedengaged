import React from 'react';

const ScrollingHelpText = ({ message, width }) => {
  return (
    <div style={{ width, overflow: 'hidden', whiteSpace: 'nowrap' }}>
      {/* eslint-disable-next-line jsx-a11y/no-distracting-elements */}
      <marquee behavior="scroll" direction="left" className="font-style-4">
        {message}
      </marquee>
    </div>
  );
};

export default ScrollingHelpText;
