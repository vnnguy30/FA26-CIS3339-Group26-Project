// B2: create an error with an HTTP status code.
// Routes call next(httpError(404, 'Client not found')) and the
// central error handler in app.js turns it into { "error": "..." }.
function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

module.exports = httpError;