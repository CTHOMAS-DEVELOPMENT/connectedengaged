import translations from './translations.json'; // Import the validation translations

const validateUser = (formData, ignoreValidation = false, languageCode = "en") => {
  // Use fallback to "en" if the language code is not available
  const validationMessages = translations[languageCode]?.validation || translations["en"].validation;

  const errors = {};

  // Username validation
  if (!formData.username.trim()) {
    errors.username = validationMessages.usernameRequired;
  } else if (formData.username.length < 8) {
    errors.username = validationMessages.usernameMinLength;
  }

  // Email validation
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!formData.email.match(emailPattern)) {
    errors.email = validationMessages.invalidEmail;
  }

  if (ignoreValidation) {
    return errors;
  }

  // Password validation
  if (formData.password.length < 8) {
    errors.password = validationMessages.passwordMinLength;
  } else if (!/[A-Z]/.test(formData.password)) {
    errors.password = validationMessages.passwordUppercase;
  } else if (!/[0-9]/.test(formData.password)) {
    errors.password = validationMessages.passwordNumber;
  }

  // Additional field validations
  if (!formData.sexualOrientation) {
    errors.sexualOrientation = validationMessages.preferredCompanyRequired;
  }
  if (!formData.sex) {
    errors.sex = validationMessages.mostLikeYouRequired;
  }
  if (!formData.hobby) {
    errors.hobby = validationMessages.favouriteHobbyRequired;
  }
  if (!formData.floatsMyBoat) {
    errors.floatsMyBoat = validationMessages.floatsYourBoatRequired;
  }
  if (!formData.aboutYou) {
    errors.aboutYou = validationMessages.aboutYouRequired;
  }
  if (!formData.aboutMyBotPal) {
    errors.aboutMyBotPal = validationMessages.adminRequired;
  }
  if (!formData.worldX) {
    errors.worldX = validationMessages.locationXRequired;
  }
  if (!formData.worldY) {
    errors.worldY = validationMessages.locationYRequired;
  }

  return errors;
};

export default validateUser;
