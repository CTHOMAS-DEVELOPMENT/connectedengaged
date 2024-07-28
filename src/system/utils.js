export const parseExpectedEnd = (expectedEndStr) => {
  const [days, hours, minutes, seconds] = expectedEndStr.split(" ").filter((_, index) => index % 2 === 0);
  return {
    days: parseInt(days, 10),
    hours: parseInt(hours, 10),
    minutes: parseInt(minutes, 10),
    seconds: parseInt(seconds, 10),
  };
};

export const calculateRemainingTime = (endTime) => {
  const totalSeconds = endTime.days * 86400 + endTime.hours * 3600 + endTime.minutes * 60 + endTime.seconds;
  return totalSeconds;
};

export const formatRemainingTime = (totalSeconds) => {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days} Days ${hours} Hours ${minutes} Minutes ${seconds} Seconds`;
};

export const extractFilename = (pathString, imgDefault="") => {
  if (!pathString) {
    return imgDefault;
  }
  // Use a regular expression to split the string on both forward slashes and backslashes
  const parts = pathString.split(/[/\\]/);
  // The last part of the array should be the filename
  return parts.pop();
};

export const getThumbnailPath = (dbPath) => {
  // Ensure the path is formatted correctly
  const formattedPath = dbPath.replace(/^backend\\imageUploaded\\|^backend\/imageUploaded\//, "/uploaded-images/");
  return formattedPath ? formattedPath : "";
};
export const convertToMediaPath = (dbPath) => {
    // Normalize the path separators
    const normalizedPath = dbPath.replace(/\\/g, '/');
    
    // Replace the initial part of the path
    const rtnValue = normalizedPath.replace(/^backend\/imageUploaded\//, "/uploaded-images/");
    
    return rtnValue ? rtnValue : "";
  };
  
