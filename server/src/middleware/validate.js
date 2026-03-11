const { ZodError } = require("zod");

function formatZodIssues(error) {
  const issues = error?.issues || error?.errors || [];

  return issues.map((issue) => ({
    path: Array.isArray(issue.path) ? issue.path.join(".") : "",
    message: issue.message,
  }));
}

exports.validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError || error?.name === "ZodError") {
      return res.status(400).json({
        error: "Validation failed",
        details: formatZodIssues(error),
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
    if (error instanceof ZodError || error?.name === "ZodError") {
      return res.status(400).json({
        error: "Query validation failed",
        details: formatZodIssues(error),
      });
    }
    next(error);
  }
};
