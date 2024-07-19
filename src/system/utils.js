export const extractFilename = (pathString, imgDefault="") => {
  if (!pathString) {
    return imgDefault;
  }
  // Use a regular expression to split the string on both forward slashes and backslashes
  const parts = pathString.split(/[/\\]/);
  // The last part of the array should be the filename
  return parts.pop();
};

export const getThumbnailPathX = imagePath => {
  const imagePathParts = imagePath.split('/');
  const filename = imagePathParts.pop();
  const thumbnailFilename = `thumb-${filename}`;
  imagePathParts.push(thumbnailFilename);
  return imagePathParts.join('/');
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
  
