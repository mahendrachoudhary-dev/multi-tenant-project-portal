import { ZodError } from "zod";

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err instanceof ZodError)
    return res.status(400).json({
      message: "Please check your input.",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  if (err.code === 11000)
    return res
      .status(409)
      .json({ message: "This email or membership already exists." });
  if (
    err.name === "CastError" ||
    err.name === "ValidationError" ||
    err.type === "entity.parse.failed"
  )
    return res.status(400).json({ message: "Invalid request data." });
  const status = err.status || 500;
  if (status >= 500) console.error("API error:", err.message);
  res.status(status).json({
    message:
      status >= 500 ? "Something went wrong. Please try again." : err.message,
  });
}
