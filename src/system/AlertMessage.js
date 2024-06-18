import React, { useEffect, useState } from 'react';
const AlertMessage = ({ message, type, centred = false }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true); 
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [message, type]);

  if (!visible) return null;

  const getColor = () => {
    switch (type) {
      case 'error': return 'red';
      case 'warning': return 'orange';
      case 'info': default: return 'blue';
    }
  };

  return (
    <div style={{ 
      color: getColor(),
      background: "white", 
      margin: '10px', 
      padding: '10px', 
      border: `1px solid ${getColor()}`, 
      position: centred ? 'fixed' : 'static',
      top: centred ? '50%' : 'auto',
      left: centred ? '50%' : 'auto',
      transform: centred ? 'translate(-50%, -50%)' : 'none',
      zIndex: centred ? 1000 : 'auto'
    }}>
      {message}
    </div>
  );
};

export default AlertMessage;
