// S1: rejects with 403 unless the logged-in user has the given role.
// Must run AFTER requireAuth, e.g. router.post('/', requireAuth, requireRole('editor'), ...)
// This is an allowlist: any role other than the one named here is refused.
const httpError = require('../utils/httpError');

module.exports = function requireRole(role) {
  return function (req, res, next) {
    if (!req.user || req.user.role !== role) {
      return next(httpError(403, 'You do not have permission to do this'));
    }
    next();
  };
};
