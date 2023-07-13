/**
 * Validates an email address using a Regular Expression.
 *
 * @param {String} emailAddress - The email address to validate
 * @returns True if the email address is valid, otherwise returns false.
 */
const validateEmailAddress = (emailAddress) => {
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(emailAddress);
};

export default validateEmailAddress;
