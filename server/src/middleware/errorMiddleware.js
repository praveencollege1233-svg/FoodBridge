export const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  const status = error.statusCode || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? "Something went wrong. Please try again." : error.message,
  });
};