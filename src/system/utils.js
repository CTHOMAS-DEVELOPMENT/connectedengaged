export const extractFilename = (pathString, imgDefault="") => {
  if (!pathString) {
    return imgDefault;
  }
  // Use a regular expression to split the string on both forward slashes and backslashes
  const parts = pathString.split(/[/\\]/);
  // The last part of the array should be the filename
  return parts.pop();
};

export const getThumbnailPath = imagePath => {
  const imagePathParts = imagePath.split('/');
  const filename = imagePathParts.pop();
  const thumbnailFilename = `thumb-${filename}`;
  imagePathParts.push(thumbnailFilename);
  return imagePathParts.join('/');
};
export const convertToMediaPath = (dbPath) => {
    console.log("convertToMediaPath-dbPath", dbPath);
    
    // Normalize the path separators
    const normalizedPath = dbPath.replace(/\\/g, '/');
    
    // Replace the initial part of the path
    const rtnValue = normalizedPath.replace(/^backend\/imageUploaded\//, "/uploaded-images/");
    
    console.log("convertToMediaPath-rtnValue", rtnValue);
    return rtnValue ? rtnValue : "";
  };
  
