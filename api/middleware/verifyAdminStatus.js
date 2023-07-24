/**
 * Verifies that the request is coming from a client with Administrator privileges before passing the request to the next middleware function.
 * Returns a 403 Forbidden status code if the request is not authenticated.
 * 
 * @param {Object} req - Express Request Object
 * @param {Object} res - Express Response Object
 * @param {Function} next - The next middleware function to call
 * @returns 
 */
const verifyAdminStatus = (req, res, next) => {
    if (!req.session.user.isAdmin) {
        return res.status(403).json({error: "You must be an Administrator to perform this action"});
    }
    next();
}

export default verifyAdminStatus;