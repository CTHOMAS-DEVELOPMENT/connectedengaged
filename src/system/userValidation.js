// userValidation.js

const validateUser = (formData, ignoreValidation = false) => {
  //console.log("formData", formData);
  const errors = {};

  // Username validation
  if (!formData.username.trim()) {
    errors.username = "Username is required";
  } else if (formData.username.length < 8) {
    errors.username = "Username must be at least 8 characters long";
  }

  // Email validation
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!formData.email.match(emailPattern)) {
    errors.email = "Invalid email format";
  }
  if (ignoreValidation) {
    return errors;
  }
  // Password validation may be validated at the backend
  if (formData.password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  } else if (!/[A-Z]/.test(formData.password)) {
    errors.password = "Password must contain at least 1 uppercase letter";
  } else if (!/[0-9]/.test(formData.password)) {
    errors.password = "Password must contain at least 1 number";
  }
  if (!formData.sexualOrientation) {
    errors.sexualOrientation="Please enter a value for 'Preferred Company'";
  }
  if (!formData.sex) {
    errors.sex="Please enter a value for 'Most Like You'";
  }
  if (!formData.hobby) {
    errors.hobby="Please enter a value for 'Favourite Hobby'";
  }
  if (!formData.floatsMyBoat) {
    errors.floatsMyBoat="Please enter a value for 'Floats Your Boat'";
  }
  if (!formData.aboutYou) {
    errors.aboutYou="Please tell everyone something about you";
  }
  if (!formData.aboutMyBotPal) {
    errors.aboutMyBotPal="Please tell your system admin who you want them to be";
  }
  if (!formData.worldX) {
    errors.worldX="Please Select your Location";
  }
  if (!formData.worldY) {
    errors.worldY="Please Select your Location";
  }
  return errors;
};

export default validateUser;
