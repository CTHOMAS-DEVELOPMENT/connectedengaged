// system/styles.js

export const reportDialogBackdropStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.5)", // 50% opacity background
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };
  export const reportDialogContentStyle = {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "320px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Adds a shadow for depth
  };

  export const reportLabelStyle = {
    fontWeight: "bold",
    marginBottom: "5px",
    alignSelf: "flex-start",
  };
  
  export const reportSelectStyle = {
    width: "100%",
    padding: "8px",
    borderRadius: "5px",
    marginBottom: "10px",
    border: "1px solid #ccc",
  };

  export const reportTextAreaStyle = {
    width: "100%",
    height: "80px",
    padding: "8px",
    borderRadius: "5px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    resize: "none",
  };

  export const reportButtonContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginTop: "10px",
  };

  export const reportButtonStyle = {
    padding: "8px 15px",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  };
  export const mainReportButtonStyle = {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "#dc3545",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    border: "none",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer",
  };
  export const verticleWrapper = {
    display: "flex",
    flexDirection: "row",
  };
  export const horizontalWrapper = {
    display: "flex",
    flexDirection: "column",
  };
 export const sendButtonDisabledStyle = {
     ...reportButtonStyle,
     backgroundColor: "grey",
     color: "white",
     cursor: "not-allowed",
   };
   export const postContainerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px",
    position: "relative", // To allow absolute positioning for buttons
  };