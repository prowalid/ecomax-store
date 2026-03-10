// Global Error Handler Middleware
exports.errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

  // PostgreSQL Unique Constraint Violation
  if (err.code === "23505") {
    return res.status(409).json({
      error: "Conflict",
      message: "A resource with that unique constraint already exists."
    });
  }

  // PostgreSQL Foreign Key Violation
  if (err.code === "23503") {
    return res.status(400).json({
      error: "Bad Request",
      message: "Referenced resource does not exist (Foreign Key Constraint)."
    });
  }

  return res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message
  });
};
