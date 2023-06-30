/**
 * Verifies that a request is coming from an authenticated user with Teacher privileges.
 * Returns a 401 Unauthorised response if the request is not verified.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - The next middleware function
 * @returns {void}
 */
const verifyTeacherRole = (req, res, next) => {

  // If active session exists and the user is a Teacher, allow this request
  if (req.session.user && req.session.user.isTeacher) {
    return next();
  }

  // Otherwise, do not allow this request
  return res.status(401).json({
    error:
      "You must be signed in with a Teacher account to perform this action",
  });
};

export default verifyTeacherRole;
