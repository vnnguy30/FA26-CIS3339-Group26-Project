// S1: rejects the request with 401 unless it carries a valid JWT.
// On success the decoded token is available as req.user ({ name, role, orgId }).
const jwt = require('jsonwebtoken');
const httpError = require('../utils/httpError');

module.exports = function requireAuth(req, res, next) {
  const header = req.header('Authorization');
  const token = header && header.split(' ')[1];

  if (!token) {
    return next(httpError(401, 'No token, authorization denied'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });

    // Tokens issued before S1 have no orgId. Without it we cannot scope queries,
    // so treat the token as invalid and make the user log in again.
    if (!decoded.orgId) {
      return next(httpError(401, 'Token is not valid'));
    }

    req.user = decoded;
    next();
  } catch (err) {
    next(httpError(401, 'Token is not valid'));
  }
};
