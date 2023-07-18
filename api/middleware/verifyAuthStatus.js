/**
 * Verifies that the request is coming from an authenticated client before passing the request to the next middleware function.
 * Returns a 401 Unauthorized status code if the request is not authenticated.
 * 
 * @param {Object} req - Express Request Object
 * @param {Object} res - Express Response Object
 * @param {Function} next - The next middleware function to call
 * @returns 
 */
const verifyAuthStatus = (req, res, next) => {
    if (!req.session.user) {
        return res.sendStatus(401);
    }
    next();
}

export default verifyAuthStatus;