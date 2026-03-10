const { ZodError } = require("zod");

exports.validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors.map(err => ({
          path: err.path.join("."),
          message: err.message
        }))
      });
    }
    next(error);
  }
};

exports.validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Query validation failed",
        details: error.errors.map(err => ({
          path: err.path.join("."),
          message: err.message
        }))
      });
    }
    next(error);
  }
};
