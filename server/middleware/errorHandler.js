/**
 * Centralized error handler. Any `next(err)` call in the app lands here.
 */
function errorHandler(err, req, res, next) {
  console.error("[error]", err.stack || err);

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}

module.exports = errorHandler;
