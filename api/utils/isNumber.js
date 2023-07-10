/**
 * Checks if a value contains only digits. 
 * Used to validate URL parameters from incoming requests.
 * 
 * @param {String} value - The value to validate
 * @returns True if the value contains only digits, otherwise returns false.
 */
const isNumber = (value) => {
  const numberRegex = /^[0-9]+$/;

  if (numberRegex.test(value)) {
    return true;
  }

  return false;
};

export default isNumber;
