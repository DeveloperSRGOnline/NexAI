export const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  const payload = { error: message };
  if (process.env.NODE_ENV === 'development') {
    payload.stack = err.stack;
  }

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${status}:`, message);
  res.status(status).json(payload);
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: `Not Found - ${req.originalUrl}` });
};
