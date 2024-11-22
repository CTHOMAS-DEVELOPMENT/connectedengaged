import React from 'react';
import peopleImage from './people.png';
const GoodBye = () => {
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#000', // Jet black background
    },
    imageWrapper: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '90%',
      height: '90%',
      border: '5px solid #fff', // White border for contrast
      borderRadius: '15px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)', // Raised border effect
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover', // Ensure image covers the viewport
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.imageWrapper}>
        <img src={peopleImage}  alt="Goodbye" style={styles.image} />
      </div>
    </div>
  );
};

export default GoodBye;
